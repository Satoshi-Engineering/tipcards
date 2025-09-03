#!/bin/sh

SYSTEM_ARCHITECTURE=$(uname -m)
NODE_MODULES_DIR=$(pwd)/node_modules

if [ "$SYSTEM_ARCHITECTURE" = "arm64" ]; then
  NODE_MODULES_DIR=$(pwd)/node_modules_docker
fi

docker run --rm \
  -v $(pwd):/app \
  -v $NODE_MODULES_DIR:/app/node_modules \
  -w /app \
  node:lts-bookworm-slim /bin/bash \
  -c "npm i"
