"""Analysis-only ASR. Reference audio never enters production assets."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import numpy as np

os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
os.environ.setdefault('HF_HOME', '/tmp/motion-models')
from faster_whisper import WhisperModel
from references import ROOT, sha256

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--model', default='small')
parser.add_argument('--project')
parser.add_argument('--generated',action='store_true',help='Check generated speech stems instead of reference audio')
parser.add_argument('--delivery',action='store_true',help='Check current narrated delivery MP4 audio')
args=parser.parse_args()
if args.generated and args.delivery:parser.error('Choose generated stems or delivery audio')
model=WhisperModel(args.model,device='cpu',compute_type='int8',cpu_threads=4,
                   download_root='/tmp/motion-models/whisper')
manifest=json.loads((ROOT/'references/manifest.json').read_text())['references']
if args.project and not any(ref['id']==args.project for ref in manifest):
    if not args.generated:parser.error('Unknown benchmark project; use --generated for an original production')
    manifest=[{'id':args.project}]
for ref in manifest:
    if args.project and ref['id']!=args.project:continue
    audio=(ROOT/'public/generated'/ref['id']/'voice.wav') if args.generated else ROOT/'analysis/reference-audio'/f'{ref["id"]}.wav'
    if args.delivery:
        if not (ROOT/'projects'/ref['id']/'narration.json').exists():continue
        candidates=json.loads((ROOT/'references/candidates.json').read_text())
        audio=(ROOT/candidates[ref['id']]).parent/'video.mp4'
    if args.generated and not audio.exists():continue
    pcm=subprocess.run(['ffmpeg','-v','error','-i',str(audio),'-ar','16000','-ac','1','-f','f32le','-'],check=True,capture_output=True).stdout
    samples=np.frombuffer(pcm,dtype='<f4')
    segments,info=model.transcribe(samples,word_timestamps=True,vad_filter=True,
                                   condition_on_previous_text=False,beam_size=5)
    data=[]
    for segment in segments:
        data.append({'start':segment.start,'end':segment.end,'text':segment.text,
                     'avgLogprob':segment.avg_logprob,'noSpeechProbability':segment.no_speech_prob,
                     'words':[{'text':word.word,'start':word.start,'end':word.end,'probability':word.probability}
                              for word in segment.words or []]})
    result={'project':ref['id'],'engine':'faster-whisper 1.2.1','model':args.model,
            'sourceAudioSha256':sha256(audio),'language':info.language,'segments':data,
            'status':'ASR draft; verify words/timing; empty output is not a listening review'}
    out=ROOT/'analysis/transcripts'/('delivery' if args.delivery else 'generated' if args.generated else '.')/f'{ref["id"]}.json';out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+'\n')
    print(ref['id'],info.language,' '.join(item['text'] for item in data),flush=True)
