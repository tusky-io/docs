FROM node:20-alpine

# Install nginx (sub_filter module is built-in on Alpine's nginx)
RUN apk add --no-cache nginx

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

# Build the search index from MDX files
RUN node scripts/build-search-index.js

# Set up nginx
RUN mkdir -p /run/nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

RUN chmod +x docker-entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
