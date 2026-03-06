FROM node:20-alpine

RUN npm install -g mintlify@latest

WORKDIR /app
COPY . .

RUN chmod +x docker-entrypoint.sh

# Verify files are correct at build time
RUN echo "BUILD CHECK - docs.json colors:" && grep -A3 '"colors"' docs.json && echo "BUILD CHECK - logo light:" && head -c 150 logo/light.svg && echo ""

ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://localhost:3000/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
