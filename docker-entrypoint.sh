#!/bin/sh
set -e

echo "=== Tusky Docs Container Starting ==="
echo "Search index: $(wc -c < /app/static/search-index.json) bytes"

# Force remove any Mintlify client cache
rm -rf /root/.mintlify /home/node/.mintlify /tmp/.mintlify 2>/dev/null || true

# Start mintlify dev in background (port 3000, internal only)
echo "=== Starting mintlify dev on :3000 ==="
mintlify dev --no-open &
MINT_PID=$!

# Wait for mintlify dev to be ready
echo "Waiting for mintlify dev to start..."
for i in $(seq 1 60); do
  if wget -qO- http://localhost:3000/ >/dev/null 2>&1; then
    echo "mintlify dev is ready (took ${i}s)"
    break
  fi
  sleep 1
done

# Start nginx in foreground (port 80, exposed to K8s)
echo "=== Starting nginx on :80 ==="
exec nginx -g 'daemon off;'
