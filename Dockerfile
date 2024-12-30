FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main cmd/api/main.go
RUN go build -o ingest cmd/ingest/ingest.go
RUN echo "Listing /app directory after build 1:" && ls -l /app

FROM golang:1.23-alpine AS prod
WORKDIR /app

COPY --from=build /app/main /app/main
COPY --from=build /app/ingest /app/ingest
COPY data-pipeline/raw_data /app/raw_data

RUN echo "Listing /app directory after build 2:" && ls -l /app
RUN apk add --no-cache make && go install github.com/air-verse/air@latest
EXPOSE ${PORT}
CMD ["air"]

FROM node:20 AS frontend_builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
RUN npm run build

FROM node:23-slim AS frontend
RUN npm install -g serve
COPY --from=frontend_builder /frontend/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "/app/dist", "-l", "5173"]