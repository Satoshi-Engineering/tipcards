#!/bin/bash

TEST_FILE=$1

if [ -z "$TEST_FILE" ]; then
  echo "Usage: $0 <path-to-test-file>"
  exit 1
fi

docker run --rm \
  --network=tipcards-internal \
  -v $(pwd):/app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -w /app \
  -e NODE_EXTRA_CA_CERTS=/app/scripts/docker/nginx/certs/rootCA.pem \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-test-one-integration-route $TEST_FILE"
