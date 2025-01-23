FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main cmd/api/main.go
RUN go build -o ingest cmd/ingest/ingest.go

FROM golang:1.23-alpine AS prod
WORKDIR /app

COPY --from=build /app/main /app/main
COPY --from=build /app/ingest /app/ingest

FROM node:20 AS frontend_builder
WORKDIR /frontend

ARG VITE_ENV
ARG VITE_BACKEND_URL_PROD
ARG VITE_BACKEND_URL_DEV
ENV WITE_ENV $VITE_ENV
ENV VITE_BACKEND_URL_PROD $VITE_BACKEND_URL_PROD
ENV VITE_BACKEND_URL_DEV $VITE_BACKEND_URL_DEV
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
RUN npm run build

FROM node:23-slim AS frontend
RUN npm install -g serve
COPY --from=frontend_builder /frontend/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "/app/dist", "-l", "5173"]