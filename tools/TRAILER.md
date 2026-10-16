# Boughbound trailer

The 45-second video uses the actual game's simulation, procedural renderer and portrait exporter. A demonstration controller supplies ordinary steering input on seed 2; it changes no game rules or rewards. The video labels gameplay as a demo, marks later excerpts, and shows their actual game time. It does not claim a manual winning run.

Generated upload files live in the ignored `artifacts/trailer/` directory:

- `Boughbound-trailer.mp4` — 1920×1080, 30 fps, H.264/yuv420p, AAC stereo, 45 seconds, streaming metadata at the beginning.
- `Boughbound-cover.jpg` — matching 1920×1080 cover.
- `manifest.json` — source seed, timing, outcome and visible event cues.

Video schedule: title 0–3.5s; normal-speed opening gameplay 3.5–16.5s; a labelled cut to game time 54–66s at video 16.5–28.5s; final game time 85–90s and bloom at video 28.5–35s; the exact run portrait at 35–41.5s; play-link card at 41.5–45s. This run scores 2,020 light and reaches five simultaneous tips.

## Reproduce

1. Run `npm run dev` and open http://127.0.0.1:5173/tools/trailer.html. The page and trailer modules are excluded from the production build. Scene previews allow inspection before recording.
2. Click **Record 45-second trailer**. Keep the page open until recording completes, then download the WebM master.
3. Save the displayed recording manifest as `artifacts/trailer/manifest.json`.
4. Run the encoder with a local FFmpeg binary:

```sh
python3 tools/finish-trailer.py \
  --master /absolute/path/to/boughbound-trailer-master.webm \
  --manifest artifacts/trailer/manifest.json \
  --output artifacts/trailer \
  --ffmpeg /absolute/path/to/ffmpeg
```

The script creates an original stereo chime arrangement, synchronizes game cues from the manifest, fades the music, and encodes an upload-ready MP4. It uses Python's standard library. There are no sampled recordings, external songs or third-party artwork. Keep generated media out of Git; upload the MP4 through the owner's chosen video host and paste its public link into the entry. Check the host processes it and permits access without signing in.
