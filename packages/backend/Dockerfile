# syntax = docker/dockerfile:experimental
# ===== Builder =====
# ===================
FROM node:12.18.2-alpine AS builder

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder/

# Cache backend's package
ADD packages/backend/package.json    packages/backend/
ADD package.json                      .
ADD yarn.lock                         .

# Cache internal modules' src
ADD packages/models packages/models
ADD packages/@types packages/@types

RUN yarn --pure-lockfile

# Cache backend's src
ADD packages/backend packages/backend

# Build
RUN yarn workspace @ltv/backend build --node-args='--stack_size=6144 --max-old-space-size=6144' --mode production

# ===== Builder02 =====
# =====================
FROM node:12.18.2-alpine AS builder02

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder02/
COPY --from=builder /builder/packages/backend/dist/ .
RUN sed -ie '/@ltv\/models/d' ./package.json
RUN sed -ie '/@ltv\/@types/d' ./package.json
ADD yarn.lock                         .
RUN yarn install --pure-lockfile --production=true


# ===== backend =====
# ==================
FROM node:12.18.2-alpine AS backend

WORKDIR /app/
COPY --from=builder   /builder/packages/backend/dist/   .
COPY --from=builder02 /builder02/node_modules ./node_modules
COPY --from=builder02 /builder02/package.json ./node_modules/package.json
