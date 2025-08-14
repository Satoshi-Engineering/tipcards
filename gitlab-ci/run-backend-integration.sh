#/bin/bash

docker run --rm \
  --network=tipcards-internal \
  -v $(pwd):/app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -w /app \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-test-integration -- --minWorkers=1 --maxWorkers=3 --testTimeout=50000"
  