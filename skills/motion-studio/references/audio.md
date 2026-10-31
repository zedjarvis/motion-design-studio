# Local, frame-indexed sound

Brag's default audio is licensed library music plus SFX, chosen and timed by
the agent. It is not generative music. This engine includes selected local
assets and their hashes/licenses in `public/audio/ledger.json`. Read the ledger
and credits rather than depending on the author's installed plugin path.

Use the available Brag SFX analysis for additional sound choices. Prefer a
coherent palette and restrained accents that match visible gestures. Cue
metadata is optional timing guidance for original films. Never move a strict
reconstruction's picture timing to fit a replacement music beat.

Write `projects/<slug>/audio-cues.json`:

```json
{
  "project": "product",
  "fps": 30,
  "durationInFrames": 600,
  "syncStatus": "provisional-cues-pending-visual-lock",
  "music": {
    "src": "audio/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3",
    "gain": 0.2,
    "fadeInFrames": 4,
    "fadeOutFrames": 21
  },
  "cues": [
    {"frame": 90, "src": "audio/sfx/interface/drop_001.ogg", "gain": 0.15, "action": "Product reveal"}
  ]
}
```

```bash
npm run audio -- product
```

The mixer requires local, ledger-backed assets, uses 48 kHz stereo, places SFX
at frame-derived sample offsets, applies music fades, normalizes in two passes
and measures the final mix. It rejects invalid cue frames and changed source
assets. Output is `public/generated/<slug>/mix.wav` with its measurement report
and credits. Include it using `Soundtrack` from `studio/shared/Soundtrack.tsx`.

Technical level/duration checks do not prove a pleasing mix or correct sync.
Listen to the complete film, check the visual action frames and make revisions.
Keep licensed music attribution with delivery. Do not relabel bundled audio as
AI-generated music. Narration is opt-in. The latest benchmark brief enables it
for Alconost, Minimalist and Phone; Creators remains music/SFX-only by explicit
user choice. Haft Studio has an original script and generated narration too.

## Brag `--voice` route

Brag's voice path is local Kokoro, not a paid-provider fallback: it invokes
`hyperframes tts script.txt --voice af_heart --output voiceover.wav`. The inspected
CLI is 0.8.198 with Kokoro-ONNX 0.6.1. The installed Brag references are
`references/step-3-compose.md` (Voiceover) and `references/audio.md`. Keep the
renderer Remotion; only the audio helper uses Hyperframes.

For reference narration, extract analysis-only audio outside `public/`,
transcribe it, verify words against visible brand names, and author
`projects/<slug>/narration.json` with `provider: "kokoro"`, `voice: "af_heart"`,
native `fps`, `durationInFrames`, and `segments` containing `text`, `startFrame`,
`endFrame`. Remove the video's PTS origin once when mapping audio times onto
picture frames. Never retime picture to fit generated speech. Estimated ASR
boundaries and a stock voice do not establish identical delivery or identity.

```bash
npm run voice -- alconost-localization
# After generation, rebuild only the mix without regenerating the voice:
npm run voice -- alconost-localization --mix-only
```

`scripts/voiceover.py` uses the actual Brag command. Prefer
`fitPolicy: "natural-within-window"` on each segment: keep natural speech speed,
fit an overrun only, and leave silence in unused time. Do not slow short speech
to fill an ASR window that may include silence. Exact-window fitting is also
available with recorded speed/correction, but can sound unnatural. It rejects overlapping/out-of-range cues and an
unnatural fit instead of truncating spoken tails. Generated WAVs, scripts,
model/voice hashes, CLI version and speech-fit metadata have provenance.

Use `<Soundtrack project="..." voiceover/>` to mount independent `bed.wav` and
`voice.wav` audio nodes. Music alone ducks to 0.13 during utterances with smooth
attack/release; SFX keep their cue gain. `mix.wav` is their measured combined
review copy. All stems have exact 48 kHz timeline sample counts and the same
final gain. Tests check stem recombination and measured ducking. `npm run audio`
respects a project's `voiceover: true` plan and rebuilds this narrated mix.

For an original repo film, author the narration from supported product claims
and choose the phrase windows in its storyboard. No speech transcription or
reference video is required. Never invent narration merely because UI text is
visible. Keep the original spoken script only when the brief requests it.

Technical duration/loudness and ASR checks are not a listening review. Listen
for pronunciation, unnatural pacing, clipped consonants and masking, then check
final audiovisual sync. Voice cloning and new paid providers are separate choices.

For audio-only iteration, `npm run mux:audio -- <project> <parent-master>` replaces
the soundtrack while retaining the studio’s captured picture. It verifies all
video packet bytes and displayed PTS against the parent, and records inherited
visual provenance plus new sound provenance. The gate requires a hash-verified
parent capture. This is not reference playback or a fresh Chrome capture.

Group nearby utterances into one music-duck passage. The default holds through
gaps up to 1.2 seconds, uses 120 ms attack / 700 ms release with smoothstep in
decibels, and avoids recovery directly into the outro fade. Inspect silent
pauses between speech peaks as well as spoken sections. Unit tests measure
that the bed stays down through a short pause and recovers smoothly later.
Write domains explicitly in `ttsText`, e.g. “Alconost dot com”; do not rely on
a written period to produce an audible “dot”.

For kinetic films without speech, place accents on the real gesture, not just
the start of every scene. Creators’ custom stereo swishes have measured RMS
peaks aligned to panel-speed peaks at native frames 303, 342, 380 and 418, over
a licensed rhythmic Brag bed. Keep picture timing fixed. Store generated SFX
source, seeds, hashes, cue anchors and credits with the production.
