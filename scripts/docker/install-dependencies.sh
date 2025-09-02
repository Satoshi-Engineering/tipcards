#!/bin/bash

docker run \
  -v $(pwd):/app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -w /app \
  node:lts-bookworm-slim /bin/bash \
  -c "npm i"
