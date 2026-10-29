# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# FLM Campus · API (y, opcionalmente, la web compilada servida desde el mismo origen).
# Se construye desde la RAÍZ del monorepo:
#   docker build -f apps/api/Dockerfile -t flm-campus .
# Para construir solo la API (sin compilar la web): --build-arg BUILD_WEB=false
# ─────────────────────────────────────────────────────────────────────────────

FROM node:24-alpine AS build
WORKDIR /repo
ARG BUILD_WEB=true
ENV CI=true
COPY . .
RUN npm ci --no-audit --no-fund
RUN npm run build -w @flm/api
RUN mkdir -p /out/web \
 && if [ "$BUILD_WEB" = "true" ]; then npm run build -w @flm/web && cp -r apps/web/dist/. /out/web/; fi

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATABASE_PATH=/app/data/campus.sqlite \
    STORAGE_DIR=/app/storage \
    BACKUP_DIR=/app/backups \
    TRUST_PROXY=true
WORKDIR /app

# su-exec: permite que el arranque ceda los privilegios de root al usuario «campus».
RUN apk add --no-cache su-exec \
 && addgroup -S -g 10001 campus \
 && adduser -S -u 10001 -G campus -H -s /sbin/nologin campus \
 && mkdir -p /app/data /app/storage /app/backups \
 && chown campus:campus /app/data /app/storage /app/backups \
 && chmod 750 /app/data /app/storage /app/backups

# El paquete compilado no necesita node_modules: todo va dentro de dist/*.mjs.
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /out/web ./web
COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod 755 /usr/local/bin/docker-entrypoint.sh

# Datos persistentes: base de datos, archivos subidos y copias de seguridad.
VOLUME ["/app/data", "/app/storage", "/app/backups"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1

# El proceso de Node se ejecuta siempre como «campus» (sin privilegios); ver docker-entrypoint.sh.
# SERVE_WEB_DIST=/app/web sirve la web desde el mismo origen (si se compiló).
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "--disable-warning=ExperimentalWarning", "dist/server.mjs"]
