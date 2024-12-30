#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS ${POSTGRES_SCHEMA};

    SET search_path TO ${POSTGRES_SCHEMA};

    \i /docker-entrypoint-initdb.d/migrations/001_create_tables.sql
EOSQL

echo "Database schema created successfully"