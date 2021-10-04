# ===== Builder =====
# ===================
FROM node:14-alpine AS builder

ARG service

RUN apk --no-cache add \
  g++ make python3 git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder/

# Cache backend's package
ADD services/${service}/package.json    services/${service}/
ADD package.json                       .
ADD yarn.lock                          .
ADD build.js                           .
ADD tsconfig.json                      .

RUN yarn --ignore-scripts --frozen-lockfile

# Cache backend's src
ADD services/$service                   services/$service
ADD shared                              shared
ADD tools                               tools

RUN yarn prisma generate --schema ./shared/prisma/schema.prisma

# Build
RUN yarn build $service

# ===== backend =====
# ==================
FROM node:14-alpine AS backend

ARG service

WORKDIR /app/
COPY --from=builder /builder/dist/$service/ .
RUN yarn --production --frozen-lockfile
