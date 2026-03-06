FROM node:20-alpine

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

# Pre-cache the mintlify client bundle during build
RUN mintlify dev --no-open & \
    PID=$!; \
    for i in $(seq 1 60); do \
      wget -qO /dev/null http://localhost:3000/ 2>/dev/null && break; \
      sleep 2; \
    done; \
    kill $PID 2>/dev/null || true; \
    sleep 2

# Next.js (underlying mintlify) respects HOSTNAME for bind address
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["mintlify", "dev", "--no-open"]
