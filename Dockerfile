FROM node:20-alpine

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

# Pre-cache the mintlify client bundle during build
RUN mintlify dev --port 4000 & \
    PID=$!; \
    for i in $(seq 1 60); do \
      wget -qO /dev/null http://localhost:4000/ 2>/dev/null && break; \
      sleep 2; \
    done; \
    kill $PID 2>/dev/null || true; \
    sleep 2

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["mintlify", "dev", "--port", "3000", "--host", "0.0.0.0"]
