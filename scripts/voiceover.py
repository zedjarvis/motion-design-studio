"""Brag's local Kokoro route, with frame-indexed speech and separate mix stems."""
import argparse
import json
import math
from pathlib import Path
import re
import shutil
import subprocess

from audio import RATE, sample_at, checked_public_path
from references import ROOT, sha256


def run(args):
    try:return subprocess.run(args,check=True,capture_output=True,text=True)
    except subprocess.CalledProcessError as error:
        raise RuntimeError(f'{args[0]} failed: {error.stderr[-4000:]}') from error


def duration(file):
    return float(json.loads(run(['ffprobe','-v','error','-show_format','-of','json',str(file)]).stdout)['format']['duration'])


def ffmpeg(inputs,graph,output):
    run(['ffmpeg','-v','error',*inputs,'-filter_complex',graph,'-map','[out]',
         '-ar',str(RATE),'-ac','2','-c:a','pcm_s24le','-y',str(output)])


def loudness(file):
    result=run(['ffmpeg','-v','info','-i',str(file),'-af',
                'loudnorm=I=-18:TP=-1.5:LRA=9:print_format=json','-f','null','-'])
    return json.loads(re.findall(r'\{\s*"input_i"[\s\S]*?\}',result.stderr)[-1])


def checked_segments(plan):
    previous=0
    for index,segment in enumerate(plan['segments']):
        a,b=segment['startFrame'],segment['endFrame']
        if not isinstance(a,int) or not isinstance(b,int) or not 0<=a<b<=plan['durationInFrames']:
            raise ValueError('Narration bounds must be integer frames inside the film')
        if a<previous:raise ValueError('Narration segments overlap')
        if not segment['text'].strip():raise ValueError('Narration text is empty')
        previous=b
        yield index,segment


def duck_groups(segments,fps,hold_gap=1.2,duration=None,fade_out=0,release=.7):
    """Treat nearby phrases as one passage, including pauses between words."""
    groups=[]
    for _,segment in segments:
        a,b=segment['startFrame']/fps,segment['endFrame']/fps
        if groups and a-groups[-1][1]<=hold_gap:
            groups[-1][1]=max(b,groups[-1][1])
        else:groups.append([a,b])
    # Do not swell the bed into an outro fade when there is no clean recovery.
    if groups and duration is not None and duration-groups[-1][1]<=release+fade_out+.2:
        groups[-1][1]=duration
    return groups


def duck_expression(segments,fps,depth=.13,hold_gap=1.2,attack=.12,release=.7,duration=None,fade_out=0):
    expression='1'
    for a,b in duck_groups(segments,fps,hold_gap,duration,fade_out,release):
        start=max(0,a-attack);end=b+release
        u=f'((t-{start})/{max(.001,a-start)})'
        v=f'((t-{b})/{release})'
        # Smoothstep in dB: zero slope at each join, no brief full-volume peaks.
        down=f'pow({depth},{u}*{u}*(3-2*{u}))'
        up=f'pow({depth},1-{v}*{v}*(3-2*{v}))'
        window=f'if(lt(t,{start}),1,if(lt(t,{a}),{down},if(lt(t,{b}),{depth},if(lt(t,{end}),{up},1))))'
        expression=f'min({expression},{window})'
    return expression


def generate(project):
    directory=ROOT/'projects'/project
    plan_file=directory/'narration.json';plan=json.loads(plan_file.read_text())
    segments=list(checked_segments(plan))
    if not segments:raise ValueError('No reference speech to synthesize')
    if plan.get('provider')!='kokoro':raise ValueError('This workflow uses the explicitly requested Brag Kokoro provider')
    cli=shutil.which('hyperframes')
    if not cli:raise RuntimeError('Install the pinned Hyperframes CLI audio tool; the studio renderer remains Remotion')
    version=run([cli,'--version']).stdout.strip()
    assets=directory/'assets/voice';assets.mkdir(parents=True,exist_ok=True)
    public=ROOT/'public'/project/'voice';public.mkdir(parents=True,exist_ok=True)
    work=ROOT/'analysis/voice'/project;work.mkdir(parents=True,exist_ok=True)
    records=[]
    voice=plan.get('voice','af_heart')
    previous_file=assets/'PROVENANCE.json'
    previous=json.loads(previous_file.read_text()) if previous_file.exists() else {}
    model_hashes={}
    for name,relative in [('model','models/kokoro-v1.0.onnx'),('voices','voices/voices-v1.0.bin')]:
        file=Path.home()/'.cache/hyperframes/tts'/relative
        if file.is_file():model_hashes[name+'Sha256']=sha256(file)
    trim='silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB,areverse'
    for index,segment in segments:
        stem=f'line-{index:02d}'
        text=work/f'{stem}.txt';text.write_text(segment.get('ttsText',segment['text'])+'\n')
        raw=assets/f'{stem}.raw.wav';clean=work/f'{stem}.clean.wav'
        cached=next((line for line in previous.get('segments',[]) if line['index']==index),None)
        fitted=assets/f'{stem}.wav'
        samples=sample_at(segment['endFrame'],plan['fps'])-sample_at(segment['startFrame'],plan['fps'])
        if (cached and previous.get('hyperframesVersion')==version and cached.get('voice')==voice
            and all(previous.get(key)==value for key,value in model_hashes.items())
            and cached.get('ttsText',cached['text'])==segment.get('ttsText',segment['text'])
            and cached.get('samples')==samples and all(cached.get(key)==value for key,value in segment.items())
            and fitted.is_file() and sha256(fitted)==cached['sha256']):
            shutil.copy2(fitted,public/fitted.name);records.append(cached)
            print(f'{project}: retained verified speech {stem}',flush=True);continue
        print(f'{project}: Kokoro {voice}: {segment["text"]}',flush=True)
        run([cli,'tts',str(text),'--voice',voice,'--speed','1','--output',str(raw),'--json'])
        run(['ffmpeg','-v','error','-i',str(raw),'-af',trim,'-y',str(clean)])
        target=samples/RATE
        speed=duration(clean)/target
        natural=segment.get('fitPolicy')=='natural-within-window'
        if not 0<speed<=1.7 or (not natural and speed<.5):raise ValueError(f'Line {index} needs an unnatural {speed:.2f}x pace; revise the utterance bounds')
        # Ask Kokoro to perform the fitted pace, then correct only its remaining
        # timing error with pitch-preserving atempo. Never cut a spoken tail.
        requested_speed=round(max(1,speed),4) if natural else round(speed,4) if abs(speed-1)>.025 else 1
        if requested_speed!=1:
            run([cli,'tts',str(text),'--voice',voice,'--speed',str(requested_speed),'--output',str(raw),'--json'])
            run(['ffmpeg','-v','error','-i',str(raw),'-af',trim,'-y',str(clean)])
        residual=max(1,duration(clean)/target) if natural else duration(clean)/target
        if not .5<=residual<=2:raise ValueError('Residual speech timing correction is outside atempo bounds')
        ffmpeg(['-i',str(clean)],f'[0:a]atempo={residual},aresample={RATE},apad=whole_len={samples},atrim=end_sample={samples}[out]',fitted)
        shutil.copy2(fitted,public/fitted.name)
        records.append({'index':index,**segment,'voice':voice,'kokoroSpeed':requested_speed,'timingEstimateSpeed':round(speed,4),
                        'residualAtempo':residual,'samples':samples,'path':f'{project}/voice/{fitted.name}',
                        'sha256':sha256(fitted),'rawSha256':sha256(raw)})
    receipt={'provider':'kokoro','model':'Kokoro-82M v1.0','voice':voice,'hyperframesVersion':version,
             'method':'Brag --voice: hyperframes tts, separate voice track, music ducking',
             'planSha256':sha256(plan_file),'status':'generated; auditory review required',
             'voiceIdentity':'Stock Kokoro voice. No speaker cloning or original waveform replay.',
             'segments':records}
    receipt.update(model_hashes)
    (assets/'PROVENANCE.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return receipt


def mix(project):
    directory=ROOT/'projects'/project
    plan_file=directory/'narration.json';voice_plan=json.loads(plan_file.read_text())
    plan=json.loads((directory/'audio-cues.json').read_text());fps=plan['fps'];frames=plan['durationInFrames']
    if (fps,frames)!=(voice_plan['fps'],voice_plan['durationInFrames']):raise ValueError('Voice and picture timing differ')
    receipt=json.loads((directory/'assets/voice/PROVENANCE.json').read_text())
    if receipt['planSha256']!=sha256(plan_file):raise ValueError('Narration script changed; regenerate speech')
    segments=list(checked_segments(voice_plan));count=sample_at(frames,fps)
    out=ROOT/'public/generated'/project;out.mkdir(parents=True,exist_ok=True)
    work=ROOT/'analysis/voice'/project;work.mkdir(parents=True,exist_ok=True)
    voice_raw=work/'voice-normalized.wav';music=work/'music-normalized.wav';bed_raw=work/'bed.wav';combined=work/'combined.wav'
    inputs=[];filters=[]
    for index,record in enumerate(receipt['segments']):
        file=checked_public_path(record['path'])
        if sha256(file)!=record['sha256']:raise ValueError('Generated speech changed after provenance was recorded')
        inputs+=['-i',str(file)]
        filters.append(f'[{index}:a]aresample={RATE},aformat=channel_layouts=stereo,adelay={sample_at(record["startFrame"],fps)}S:all=1[v{index}]')
    labels=''.join(f'[v{i}]'for i in range(len(segments)))
    filters.append(f'{labels}amix=inputs={len(segments)}:normalize=0,apad=whole_len={count},atrim=end_sample={count},loudnorm=I=-18:TP=-3:LRA=9,aresample={RATE},apad=whole_len={count},atrim=end_sample={count}[out]')
    ffmpeg(inputs,';'.join(filters),voice_raw)
    ledger=json.loads((ROOT/'public/audio/ledger.json').read_text())['assets'];known={entry['path']:entry for entry in ledger}
    credits=set()
    for track in [plan['music'],*plan['cues']]:
        if track['src'] not in known or sha256(checked_public_path(track['src']))!=known[track['src']]['sha256']:raise ValueError('Unverified library sound')
        credits.add(known[track['src']]['credit'])
    fade_in=sample_at(plan['music'].get('fadeInFrames',4),fps);fade_out=sample_at(plan['music'].get('fadeOutFrames',20),fps)
    ffmpeg(['-i',str(checked_public_path(plan['music']['src']))],f'[0:a]aresample={RATE},atrim=end_sample={count},apad=whole_len={count},loudnorm=I=-18:TP=-3:LRA=9,aresample={RATE},afade=t=in:ss=0:ns={fade_in},afade=t=out:ss={count-fade_out}:ns={fade_out},apad=whole_len={count},atrim=end_sample={count}[out]',music)
    duck_options={'hold_gap':1.2,'attack':.12,'release':.7,'duration':count/RATE,'fade_out':fade_out/RATE}
    duck=duck_expression(segments,fps,**duck_options)
    inputs=['-i',str(music)];filters=[f"[0:a]volume='{duck}':eval=frame[m]"];labels='[m]'
    for index,cue in enumerate(plan['cues'],1):
        inputs+=['-i',str(checked_public_path(cue['src']))]
        filters.append(f'[{index}:a]aresample={RATE},volume={cue["gain"]},adelay={sample_at(cue["frame"],fps)}S:all=1[s{index}]');labels+=f'[s{index}]'
    filters.append(f'{labels}amix=inputs={len(plan["cues"])+1}:normalize=0,apad=whole_len={count},atrim=end_sample={count}[out]')
    ffmpeg(inputs,';'.join(filters),bed_raw)
    ffmpeg(['-i',str(bed_raw),'-i',str(voice_raw)],f'[0:a][1:a]amix=inputs=2:normalize=0,apad=whole_len={count},atrim=end_sample={count}[out]',combined)
    levels=loudness(combined)
    gain_db=min(-18-float(levels['input_i']),-1.5-float(levels['input_tp']))
    for source,name in [(bed_raw,'bed.wav'),(voice_raw,'voice.wav'),(combined,'mix.wav')]:
        ffmpeg(['-i',str(source)],f'[0:a]volume={gain_db}dB,apad=whole_len={count},atrim=end_sample={count}[out]',out/name)
    levels=loudness(out/'mix.wav')
    passed=abs(float(levels['input_i'])+18)<=.5 and float(levels['input_tp'])<=-1
    credits.add(f'AI narration generated locally with Kokoro-82M v1.0, stock voice {receipt["voice"]}, via Hyperframes {receipt["hyperframesVersion"]}.')
    report={'project':project,'status':'measured-not-listened','technicalChecksPassed':passed,
            'sampleRate':RATE,'channels':2,'samples':count,'fps':fps,'frames':frames,'loudness':levels,
            'planSha256':sha256(directory/'audio-cues.json'),'narrationPlanSha256':sha256(plan_file),
            'voiceover':True,'voice':receipt['voice'],'musicDuckGain':.13,'sharedOutputGainDb':gain_db,
            'ducking':{**duck_options,'curve':'smoothstep in decibels','groupsSeconds':duck_groups(segments,fps,hold_gap=1.2,duration=count/RATE,fade_out=fade_out/RATE)},
            'stems':{name:sha256(out/name) for name in ['bed.wav','voice.wav','mix.wav']},
            'sha256':sha256(out/'mix.wav'),'credits':sorted(credits),
            'note':'Separate music/SFX and generated speech stems. Music alone ducks; SFX retain their cue gain. Content/timing and auditory review are separate.'}
    (out/'audio-report.json').write_text(json.dumps(report,indent=2)+'\n')
    (out/'CREDITS.txt').write_text('\n'.join(sorted(credits))+'\n')
    if not passed:raise RuntimeError('Narrated mix loudness/peak gate failed')
    print(f'{project}: separate bed.wav + voice.wav; final mix {levels["input_i"]} LUFS; technical PASS')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('project');parser.add_argument('--mix-only',action='store_true');args=parser.parse_args()
    if not args.mix_only:generate(args.project)
    mix(args.project)
