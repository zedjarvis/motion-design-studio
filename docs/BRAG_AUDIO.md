# Brag audio implementation and the studio adaptation

The inspected Brag plugin is version 0.5.0. Its `SKILL.md` parses `--voice`,
sets `voice.enabled = true`, and selects Kokoro explicitly. The implementation
guide is `references/step-3-compose.md`, Voiceover section. Its command is:

```bash
hyperframes tts script.txt --voice af_heart --output voiceover.wav
```

The installed Hyperframes CLI is 0.8.198. Its `src/tts/manager.ts` distribution
(`dist/chunk-AHPGAESX.js`) resolves Kokoro v1.0 ONNX weights and the v1.0 voices
bank from the kokoro-onnx release. `src/tts/synthesize.ts`
(`dist/synthesize-PKTB5ATG.js`) runs the configured Python runtime. Its core is:

```python
model = kokoro_onnx.Kokoro(model_path, voices_path)
samples, sample_rate = model.create(text, voice=voice, speed=speed, lang=lang)
soundfile.write(output_path, samples, sample_rate)
```

This machine has Kokoro-ONNX 0.6.1, SoundFile 0.14.0 and ONNX Runtime 1.31.0 in
Hyperframes' configured TTS virtual environment. A real synthesis test succeeded.
No API key, paid generation call, or speaker clone was used. The generated WAVs
are local render inputs; generation never happens during frame capture.

Brag's music and effects are separate from TTS: Sascha Ende's licensed library
music and Kenney CC0 SFX, selected by the agent using Brag's cue/SFX analysis.
Those beds and effects are not AI-generated music. Brag puts voice on a separate
track and ducks music to 0.12–0.15 while narration plays.

## Studio code

- `scripts/voiceover.py`: actual Hyperframes/Kokoro command, fixed phrase windows,
  per-line cache/provenance, optional bounded speed fitting and natural delivery,
  music-only ducking to 0.13, independent final stems and level/sample checks.
- `studio/shared/Soundtrack.tsx`: Remotion `Audio` nodes for `bed.wav` and
  `voice.wav`. The unvoiced path uses the ordinary music/SFX `mix.wav`.
- `scripts/audio.py`: respects an enabled narration plan instead of silently
  replacing its soundtrack with an unvoiced mix.
- `scripts/transcribe-reference.py`: analysis-only source/generated speech
  transcription. Original audio never enters production media.
- `tests/voiceover_test.py`: rejects clipped/overlapping speech windows, checks
  actual output sample counts, stem recombination and measured duck depth.

```bash
npm run voice -- alconost-localization
npm run voice -- minimalist-priceless
npm run voice -- glassy-phone
npm run voice -- alconost-localization --mix-only
```

`narration.json` stores canonical words and integer frame bounds. Optional
`ttsText` is a pronunciation hint: SaaS → “sass”, Twobase → “Two Base”. It does
not replace the written source script. `assets/voice/PROVENANCE.json` records
each generated line, speed, timing correction, voice/model hashes and CLI
version. Source transcript spelling errors for brand names are corrected against
the visible artwork. These are stock Kokoro performances, not claims of an
identical original speaker or intonation.

Alconost, Minimalist and Phone have regenerated reference narration. Minimalist
and Phone now preserve natural Kokoro speed within their phrase windows, leaving
silence instead of forced slowing. Haft Studio has a new original script from
its repo evidence and the same local voice workflow. Creators
is music/SFX-only by explicit user choice: its ASR result was low-confidence.
Phrase times subtract the fixed source video PTS origin once, then quantize to
native frames. Picture timing never changes to accommodate speech. This differs
from Brag's original-film guidance to flex scene durations around narration,
because the benchmark explicitly forbids visual retiming.

Final `mix.wav` is the combined review copy; `bed.wav` and `voice.wav` are the
independent playback stems with the same final gain. Reports distinguish meter
and transcription checks from a listening review. The latter remains required.

A user reported unnatural delivery near Minimalist’s ending. The cause was
slowing a short phrase to fill an ASR window containing silence. The new
`natural-within-window` policy keeps normal delivery, caps only an overrun, and
pads the remaining window. A regression test checks that a short phrase stays
at normal speed and its hold is silent. Listening approval is still separate.
