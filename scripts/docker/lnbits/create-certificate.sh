#!/bin/sh

# exit if any command in the script exits with a code != 0
set -e

docker run --rm \
  -v "$PWD/certs:/out" \
  -v "$PWD/../nginx/certs/rootCA.pem:/input/rootCA.pem:ro" \
  python:3.12-slim-bookworm \
  /bin/sh -lc 'apt-get update >/dev/null && apt-get install -y --no-install-recommends ca-certificates >/dev/null && \
               cat /etc/ssl/certs/ca-certificates.crt /input/rootCA.pem > /out/combined.pem && \
               echo "Wrote /out/combined.pem"'
