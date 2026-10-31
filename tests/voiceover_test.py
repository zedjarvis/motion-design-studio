import array
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import shutil
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import voiceover
from references import sha256


class VoiceoverTests(unittest.TestCase):
    def test_short_natural_phrase_keeps_its_pace_and_pads_the_hold(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);project=root/'projects/test';project.mkdir(parents=True)
            plan={'project':'test','provider':'kokoro','voice':'af_heart','fps':10,'durationInFrames':30,
                  'segments':[{'text':'A natural short phrase.','startFrame':0,'endFrame':25,'fitPolicy':'natural-within-window'}]}
            (project/'narration.json').write_text(json.dumps(plan))
            tone=root/'tts.wav'
            subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','sine=frequency=240:duration=1',
                            '-ar','24000','-y',str(tone)],check=True)
            real_run=voiceover.run;calls=[]
            def external(args):
                if args[0]!='/fake/hyperframes':return real_run(args)
                if args[1]=='--version':return subprocess.CompletedProcess(args,0,'0.8.198','')
                calls.append(args);shutil.copy2(tone,Path(args[args.index('--output')+1]))
                return subprocess.CompletedProcess(args,0,'{}','')
            with patch('voiceover.ROOT',root),patch('voiceover.shutil.which',return_value='/fake/hyperframes'),patch('voiceover.Path.home',return_value=root),patch('voiceover.run',side_effect=external):
                receipt=voiceover.generate('test')
            self.assertEqual([args[args.index('--speed')+1]for args in calls],['1'])
            self.assertEqual(receipt['segments'][0]['residualAtempo'],1)
            fitted=root/'public/test/voice/line-00.wav'
            raw=subprocess.run(['ffmpeg','-v','error','-i',str(fitted),'-f','f64le','-'],capture_output=True,check=True).stdout
            samples=array.array('d',raw)
            self.assertEqual(len(samples),48000*2*2.5)
            self.assertGreater(max(abs(x)for x in samples[:48000]),.01)
            self.assertEqual(max(abs(x)for x in samples[120000:]),0)

    def test_spoken_tail_cannot_extend_beyond_picture(self):
        with self.assertRaises(ValueError):
            list(voiceover.checked_segments({'durationInFrames':30,'segments':[
                {'startFrame':20,'endFrame':31,'text':'Do not truncate this sentence.'}]}))

    def test_overlapping_narration_is_rejected(self):
        with self.assertRaises(ValueError):
            list(voiceover.checked_segments({'durationInFrames':30,'segments':[
                {'startFrame':0,'endFrame':15,'text':'First line.'},
                {'startFrame':14,'endFrame':25,'text':'Second line.'}]}))

    def test_separate_stems_recombine_and_music_ducks_only_during_voice(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);project=root/'projects/test';public=root/'public'
            (project/'assets/voice').mkdir(parents=True);(public/'test/voice').mkdir(parents=True);(public/'audio').mkdir()
            def tone(file,hz,seconds):
                subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i',f'sine=frequency={hz}:duration={seconds}',
                                '-ar','48000','-ac','2','-c:a','pcm_s24le','-y',str(file)],check=True)
            tone(public/'audio/music.wav',100,6);tone(public/'test/voice/first.wav',240,.5);tone(public/'test/voice/second.wav',240,1)
            audio={'project':'test','fps':10,'durationInFrames':60,
                   'music':{'src':'audio/music.wav','gain':.2,'fadeInFrames':1,'fadeOutFrames':1},'cues':[]}
            narration={'fps':10,'durationInFrames':60,'segments':[{'startFrame':5,'endFrame':10,'text':'First phrase.'},{'startFrame':15,'endFrame':25,'text':'Second phrase.'}]}
            (project/'audio-cues.json').write_text(json.dumps(audio));(project/'narration.json').write_text(json.dumps(narration))
            (public/'audio/ledger.json').write_text(json.dumps({'assets':[{'path':'audio/music.wav','sha256':sha256(public/'audio/music.wav'),'credit':'Synthetic test tone'}]}))
            receipt={'voice':'af_heart','hyperframesVersion':'test','planSha256':sha256(project/'narration.json'),
                     'segments':[{'startFrame':5,'path':'test/voice/first.wav','sha256':sha256(public/'test/voice/first.wav')},{'startFrame':15,'path':'test/voice/second.wav','sha256':sha256(public/'test/voice/second.wav')}]}
            (project/'assets/voice/PROVENANCE.json').write_text(json.dumps(receipt))
            with patch('voiceover.ROOT',root),patch('audio.ROOT',root):voiceover.mix('test')
            def decode(file):
                result=subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','f64le','-'],capture_output=True,check=True)
                return array.array('d',result.stdout)
            out=public/'generated/test';bed=decode(out/'bed.wav');voice=decode(out/'voice.wav');mix=decode(out/'mix.wav')
            self.assertEqual(len(mix),48000*6*2)
            self.assertLess(max(abs(a+b-c)for a,b,c in zip(bed,voice,mix)),4/(2**23))
            def rms(a,start,end):
                section=a[int(start*96000):int(end*96000)]
                return (sum(value*value for value in section)/len(section))**.5
            self.assertAlmostEqual(rms(bed,1.1,1.3)/rms(bed,4,4.2),.13,delta=.01)
            self.assertEqual(max(abs(value)for value in voice[:40000]),0)
            self.assertEqual(max(abs(value)for value in voice[105600:124800]),0) # The pause is silent, while its music stays ducked.
            recovery=[rms(bed,2.5+i*.1,2.54+i*.1)for i in range(9)]
            self.assertEqual(recovery,sorted(recovery))
            self.assertTrue(all(b/a<1.8 for a,b in zip(recovery,recovery[1:])))
            self.assertTrue(json.loads((out/'audio-report.json').read_text())['technicalChecksPassed'])


if __name__=='__main__':unittest.main()
