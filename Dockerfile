FROM node:20-alpine

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD rm -rf /root/.mintlify /tmp/.mintlify ~/.cache/mintlify 2>/dev/null; exec mintlify dev --no-open
