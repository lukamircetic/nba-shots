#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS ${POSTGRES_SCHEMA};

    SET search_path TO ${POSTGRES_SCHEMA};
EOSQL

for file in /docker-entrypoint-initdb.d/migrations/*.sql; do
    echo "Applying migration: $file"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
done

echo "Database schema created successfully"