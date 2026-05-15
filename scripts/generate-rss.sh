#!/usr/bin/env bash
# Wrapper na scripts/generate-rss.js — tworzy feed.xml w root repo.
# Usage: bash scripts/generate-rss.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "${HERE}/generate-rss.js"
