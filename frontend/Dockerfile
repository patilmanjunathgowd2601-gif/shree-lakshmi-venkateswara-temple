# --- Frontend Dockerfile: multi-stage build, served by nginx ---

# Stage 1: build the static Vite/React bundle
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve the built assets with nginx - running entirely as a
# non-root user (DevSecOps hardening: no process in this container ever
# runs as root, matching the runAsNonRoot securityContext set in
# k8s/frontend/deployment.yaml). nginx normally needs root to bind port 80
# and to write its cache/pid files, so we listen on 8080 instead (see
# nginx.conf) and pre-create/chown everything nginx needs to write.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache wget \
    && mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
      /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx /var/run/nginx.pid /usr/share/nginx/html /etc/nginx/conf.d

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

USER nginx
CMD ["nginx", "-g", "daemon off;"]
