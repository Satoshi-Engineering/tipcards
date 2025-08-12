#/bin/bash

docker run -d \
  --name tipcards \
  --network=tipcards-local-dev_default \
  -v $(pwd):/app \
  -w /app \
  -p 4000:4000 \
  -p 4001:4001 \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  node:lts-bookworm-slim /bin/bash \
  -c "npm run backend-dev"

echo "Waiting for tipcards to become ready..."
for i in $(seq 1 10); do
  if docker logs tipcards 2>&1 | grep -qi "app running and listening on port"; then
    echo "Tipcards is up! (matched readiness log line)"
    break
  fi
  echo "Still waiting... (#$i)"
  sleep 1
done

# Fail the job if it never became ready
if ! docker logs tipcards 2>&1 | grep -qi "app running and listening on port"; then
  echo "Tipcards did not become ready in time. Recent logs:"
  docker logs tipcards
  exit 1
fi
