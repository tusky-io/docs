#!/bin/sh
set -e

echo "=== Tusky Docs Container Starting ==="
echo "Working directory: $(pwd)"
echo "docs.json theme: $(grep -o '"theme"[^,]*' docs.json)"
echo "docs.json colors: $(grep -A3 '"colors"' docs.json | head -4)"
echo "Logo light exists: $(test -f logo/light.svg && echo 'yes' || echo 'no')"
echo "Logo light content: $(head -c 100 logo/light.svg)"

# Force remove any Mintlify client cache
rm -rf /root/.mintlify /home/node/.mintlify /tmp/.mintlify 2>/dev/null || true

echo "=== Starting mintlify dev ==="
exec mintlify dev --no-open
