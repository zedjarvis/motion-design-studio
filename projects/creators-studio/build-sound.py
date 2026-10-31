"""Authored stereo transition swishes; align energy peaks to measured panel speed."""
import hashlib
import json
import math
from pathlib import Path
import random
import shutil
import struct
import sys
import wave

PROJECT=Path(__file__).resolve().parent
ROOT=PROJECT.parent.parent
motion=json.loads((PROJECT/'src/motion.json').read_text())
ledger_file=ROOT/'public/audio/ledger.json'
ledger=json.loads(ledger_file.read_text())
track='happy-beats-business-moves-vol-9-by-ende-dot-app.mp3'
(PROJECT/'assets/music').mkdir(parents=True,exist_ok=True)
if len(sys.argv)>1:
    source=Path(sys.argv[1])
    shutil.copy2(source/track,PROJECT/'assets/music'/track)
    shutil.copy2(source/'cues'/track.replace('.mp3','.music-cues.md'),PROJECT/'assets/music/cues.md')
    shutil.copy2(source/'README.md',PROJECT/'assets/music/LICENSE-AND-SOURCE.md')
if not (PROJECT/'assets/music'/track).exists():raise SystemExit('Supply Brag music directory once; subsequent runs use retained local assets.')
shutil.copy2(PROJECT/'assets/music'/track,ROOT/'public/audio/music'/track)
def sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()
def register(record):
    ledger['assets']=[entry for entry in ledger['assets'] if entry['path']!=record['path']]+[record]
register({'path':'audio/music/'+track,'sha256':sha(PROJECT/'assets/music'/track),
          'source':'Brag 0.5.0 bundled library','creator':'Sascha Ende','sourceUrl':'https://ende.app/en',
          'license':'CC BY 4.0','credit':'Music: Sascha Ende, ende.app (CC BY 4.0)'})
assets=PROJECT/'assets/sfx';assets.mkdir(parents=True,exist_ok=True)
public=ROOT/'public/creators-studio/sfx';public.mkdir(parents=True,exist_ok=True)
cues=[];provenance=[]
for index,(name,pan_start,pan_end) in enumerate([('firstWipe',1,-1),('secondWipe',0,0),('thirdWipe',-1,1),('finalDrop',0,0)]):
    entry=motion[name];positions=entry['positions'];steps=[abs(b-a)for a,b in zip(positions,positions[1:])]
    anchor=entry['from']+1+max(range(len(steps)),key=steps.__getitem__)
    frames=len(positions);length=frames*1000;center=(anchor-entry['from'])/max(1,frames-1)
    rng=random.Random(2300+index);low=slow=0;samples=[]
    for sample in range(length):
        u=sample/max(1,length-1)
        noise=rng.uniform(-1,1);cutoff=1800+3600*math.sin(math.pi*u)**2
        low+=(1-math.exp(-2*math.pi*cutoff/48000))*(noise-low)
        slow+=(1-math.exp(-2*math.pi*350/48000))*(low-slow)
        envelope=math.exp(-.5*((u-center)/.16)**2)*math.sin(math.pi*u)**.5
        pan=pan_start+(pan_end-pan_start)*u
        value=(low-slow)*envelope
        samples.append((value*math.cos((pan+1)*math.pi/4),value*math.sin((pan+1)*math.pi/4)))
    gain=.48/max(abs(value)for pair in samples for value in pair)
    samples=[(a*gain,b*gain)for a,b in samples]
    energy=[sum(a*a+b*b for a,b in samples[f*1000:(f+1)*1000]) for f in range(frames)]
    peak=max(range(frames),key=energy.__getitem__)
    file=assets/f'{name}.wav'
    with wave.open(str(file),'wb')as audio:
        audio.setnchannels(2);audio.setsampwidth(2);audio.setframerate(48000)
        audio.writeframes(b''.join(struct.pack('<hh',round(a*32767),round(b*32767))for a,b in samples))
    shutil.copy2(file,public/file.name)
    relative='creators-studio/sfx/'+file.name
    register({'path':relative,'sha256':sha(file),'source':'Authored procedural synthesis: projects/creators-studio/build-sound.py',
              'creator':'Motion Design Studio','license':'Studio-authored synthesis; no external audio samples',
              'credit':'Transition swishes: authored in Motion Design Studio'})
    cues.append({'frame':anchor-peak,'src':relative,'gain':.24,'action':name+' stereo swish',
                 'anchorFrame':anchor,'assetPeakFrame':peak})
    cues.append({'frame':anchor,'src':'audio/sfx/impact/impactSoft_medium_001.ogg','gain':.14,'action':name+' movement accent'})
    provenance.append({'file':file.name,'seed':2300+index,'frames':frames,'pan':[pan_start,pan_end],
                       'movementPeakFrame':anchor,'assetRmsPeakFrame':peak,'sha256':sha(file)})
cues.extend([{'frame':frame,'src':src,'gain':gain,'action':action}for frame,src,gain,action in [
    (10,'audio/sfx/interface/drop_001.ogg',.12,'Camera arrival'),
    (48,'audio/sfx/impact/impactSoft_medium_001.ogg',.09,'Body tumble settles'),
    (64,'audio/sfx/interface/click_003.ogg',.12,'Lens detaches'),
    (100,'audio/sfx/interface/click_003.ogg',.15,'Lens attachment / searchlight begins'),
    (432,'audio/sfx/impact/impactBell_heavy_000.ogg',.09,'Final lockup settles')]])
plan=json.loads((PROJECT/'audio-cues.json').read_text())
plan['music']={'src':'audio/music/'+track,'gain':.24,'fadeInFrames':6,'fadeOutFrames':30}
plan['cues']=sorted(cues,key=lambda cue:cue['frame'])
plan['method']='Licensed rhythmic Brag music bed, custom stereo swishes with RMS peaks on measured panel-speed peaks, and restrained Kenney clicks/impacts. No narration or reference audio.'
(PROJECT/'audio-cues.json').write_text(json.dumps(plan,indent=2)+'\n')
(assets/'PROVENANCE.json').write_text(json.dumps({'sourceScriptSha256':sha(Path(__file__)),'synthesis':'Seeded band-limited noise, shaped envelope, equal-power stereo panning. No reference waveform.','effects':provenance},indent=2)+'\n')
ledger_file.write_text(json.dumps(ledger,indent=2)+'\n')
