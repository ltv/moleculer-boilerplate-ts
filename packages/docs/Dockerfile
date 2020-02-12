# ===== Builder =====
# ===================
FROM node:10.15.0 AS builder

WORKDIR /app/
ADD docs/package.json .
RUN yarn install
ADD docs/src ./src
RUN yarn build

# ===== Image =====
# ==================
FROM nginx:alpine AS docs
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/src/.vuepress/dist/ .
