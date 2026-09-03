#!/usr/bin/env bash
# Regenerate the web assets in web/ from the originals.
# Photos: max 1920px on the long edge, quality 82, metadata stripped.
# Audio:  160kbps mp3.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p web/rings web/other web/music

for f in photos-rings/*.jpg; do
  magick "$f" -auto-orient -resize '1920x1920>' -quality 82 -strip "web/rings/$(basename "$f")"
done

for f in photos-other/*.jpg; do
  magick "$f" -auto-orient -resize '1920x1920>' -quality 82 -strip "web/other/$(basename "$f")"
done

ffmpeg -y -loglevel error -i music/BestToYou.mp3 -codec:a libmp3lame -b:a 160k web/music/BestToYou.mp3

du -sh web/rings web/other web/music
