# Simple Makefile for a Go project

# Build the application
build:
	@echo "Building..."


	@go build -o main cmd/api/main.go
	@go build -o ingest cmd/ingest/ingest.go
# Run the application
run:
	@go run cmd/api/main.go &
	@npm install --prefix ./frontend
	@npm run dev --prefix ./frontend

# Create DB container
docker-run:
	@if docker compose up --build 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose up --build; \
	fi

# Shutdown DB container
docker-down:
	@if docker compose down -v 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose down; \
	fi

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main
	@rm -f ingest

.PHONY: all build run test clean watch docker-run docker-down itest
