#/bin/bash

docker run -d \
  --name tipcards-frontend \
  --network=tipcards-local-dev_default \
  -v $(pwd):/app \
  -w /app \
  -v $(pwd)/node_modules_docker:/app/node_modules \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run frontend-build && npm run frontend-preview 5050"

echo "Waiting for tipcards-frontend to become ready..."
for i in $(seq 1 10); do
  if docker logs tipcards-frontend 2>&1 | grep -qi "Local:   http://localhost:5050/"; then
    echo "Tipcards Frontend is up! (matched readiness log line)"
    break
  fi
  echo "Still waiting... (#$i)"
  sleep 1
done

# Fail the job if it never became ready
if ! docker logs tipcards-frontend 2>&1 | grep -qi "Local:   http://localhost:5050/"; then
  echo "Tipcards Frontend did not become ready in time. Recent logs:"
  docker logs tipcards-frontend
  exit 1
fi