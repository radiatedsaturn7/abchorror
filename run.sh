#!/usr/bin/env bash
set -euo pipefail

git pull

python3 server.py
