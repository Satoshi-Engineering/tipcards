#/bin/bash

docker run -d \
  --name tipcards-backend \
  --network=tipcards-internal \
  -v $(pwd):/app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -w /app \
  -e NODE_EXTRA_CA_CERTS=/app/scripts/docker/nginx/certs/rootCA.pem \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-dev"

echo "Waiting for tipcards-backend to become ready..."
for i in $(seq 1 10); do
  if docker logs tipcards-backend 2>&1 | grep -qi "app running and listening on port"; then
    echo "Tipcards is up! (matched readiness log line)"
    break
  fi
  echo "Still waiting... (#$i)"
  sleep 1
done

# Fail the job if it never became ready
if ! docker logs tipcards-backend 2>&1 | grep -qi "app running and listening on port"; then
  echo "Tipcards did not become ready in time. Recent logs:"
  docker logs tipcards-backend
  exit 1
fi
