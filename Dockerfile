FROM node:20-alpine AS base

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["mintlify", "dev", "--port", "3000", "--host", "0.0.0.0"]
