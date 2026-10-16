"""Add original synthesized audio and encode the local canvas recording as MP4."""

from array import array
import argparse
import json
import math
from pathlib import Path
import shutil
import subprocess
import wave


def soundtrack(manifest, destination):
    rate = 44100
    duration = float(manifest['duration'])
    size = round((duration + 0.2) * rate)
    left, right = array('f', [0]) * size, array('f', [0]) * size

    def tone(start, frequency, length, volume, pan=0.0, pad=False):
        begin = max(0, round(start * rate))
        end = min(size, round((start + length) * rate))
        l_gain, r_gain = math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)
        for sample in range(begin, end):
            time = (sample - begin) / rate
            if pad:
                envelope = min(1, time / 1.5) * min(1, max(0, length - time) / 2)
            else:
                envelope = min(1, time / .012) * math.exp(-4.5 * time / length)
                envelope *= min(1, max(0, length - time) / .05)
            phase = 2 * math.pi * frequency * time
            value = (math.sin(phase) + .13 * math.sin(phase * 2) + .025 * math.sin(phase * 3)) * envelope * volume
            left[sample] += value * l_gain
            right[sample] += value * r_gain

    # A quiet original score in the same pentatonic palette as the game.
    for start, chord in [(0, [130.81, 164.81, 196]), (10, [110, 164.81, 220]),
                         (20, [146.83, 196, 293.66]), (30, [130.81, 196, 261.63]),
                         (40, [130.81, 164.81, 261.63])]:
        for i, frequency in enumerate(chord):
            tone(start, frequency, 11, .018, (i - 1) * .35, pad=True)
    phrase = [261.63, 392, 440, 329.63, 523.25, 392, 293.66, 329.63]
    for beat in range(58):
        start = 1.0 + beat * .75
        if start < 43:
            tone(start, phrase[beat % len(phrase)], 1.7, .029, math.sin(beat * .6) * .4)

    note_index = 0
    notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]
    for event in manifest.get('events', []):
        start, kind = event['time'], event['kind']
        if kind == 'light':
            tone(start, notes[note_index % len(notes)], .6, .075)
            note_index += 1
        elif kind == 'fork':
            for i, frequency in enumerate([329.63, 440, 659.25]):
                tone(start + i * .09, frequency, 1.3, .07, (i - 1) * .25)
        elif kind == 'prune':
            tone(start, 130.81, .35, .075)
        elif kind == 'win':
            for i, frequency in enumerate([261.63, 329.63, 392, 523.25, 659.25]):
                tone(start + i * .15, frequency, 2, .09, (i - 2) * .15)

    peak = max(max(abs(x) for x in left), max(abs(x) for x in right), .001)
    gain = min(1.8, .62 / peak)
    pcm = array('h')
    for i in range(round(duration * rate)):
        fade = min(1, i / rate / .6, max(0, duration - i / rate) / 1.2)
        pcm.append(round(max(-1, min(1, left[i] * gain * fade)) * 32767))
        pcm.append(round(max(-1, min(1, right[i] * gain * fade)) * 32767))
    with wave.open(str(destination), 'wb') as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(rate)
        output.writeframes(pcm.tobytes())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--master', required=True, type=Path)
    parser.add_argument('--manifest', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'))
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error('Provide --ffmpeg with your local encoder path.')
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(args.manifest.read_text())
    audio = args.output / 'boughbound-soundtrack.wav'
    soundtrack(manifest, audio)
    video = args.output / 'Boughbound-trailer.mp4'
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-y',
                    '-i', str(args.master), '-i', str(audio), '-map', '0:v:0', '-map', '1:a:0',
                    '-t', str(manifest['duration']), '-vf', 'fps=30,format=yuv420p',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high',
                    '-level:v', '4.1', '-af', 'volume=6dB', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100',
                    '-movflags', '+faststart', '-metadata', 'title=Boughbound — Every branch is a chance',
                    '-metadata', 'comment=Gameplay demonstration with scripted input; normal-speed excerpts from one 90-second run.',
                    str(video)], check=True)
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-y',
                    '-ss', '1.5', '-i', str(video), '-frames:v', '1', '-q:v', '2',
                    '-update', '1', str(args.output / 'Boughbound-cover.jpg')], check=True)
    print(video)


if __name__ == '__main__':
    main()
