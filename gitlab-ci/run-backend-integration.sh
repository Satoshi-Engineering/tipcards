#/bin/bash

docker run --rm \
  --network=tipcards-localhost \
  -v $(pwd):/app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -w /app \
  -e NODE_EXTRA_CA_CERTS=/app/scripts/docker/nginx/certs/rootCA.pem \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-test-integration -- --minWorkers=1 --maxWorkers=3 --testTimeout=50000"
