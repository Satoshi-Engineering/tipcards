SYSTEM_ARCHITECTURE=$(uname -m)
NODE_MODULES_DIR=$(pwd)/node_modules

if [ "$SYSTEM_ARCHITECTURE" = "arm64" ]; then
  NODE_MODULES_DIR=$(pwd)/node_modules_docker
fi

docker run --rm \
  --network=tipcards-localhost \
  -v $(pwd):/app \
  -v $NODE_MODULES_DIR:/app/node_modules \
  -w /app \
  -e NODE_EXTRA_CA_CERTS=/app/scripts/docker/nginx/certs/rootCA.pem \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-test-integration -- --minWorkers=1 --maxWorkers=3 --testTimeout=50000"
