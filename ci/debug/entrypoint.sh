#!/usr/bin/env sh

dumb-init node --max-old-space-size=6144 ./main.js
