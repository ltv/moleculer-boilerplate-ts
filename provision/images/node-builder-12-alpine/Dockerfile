# syntax = docker/dockerfile:experimental
# ===== Builder =====
# ===================
FROM node:12-alpine AS builder

RUN apk --no-cache add \
  g++ make python git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*
