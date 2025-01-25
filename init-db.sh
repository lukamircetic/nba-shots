#!/bin/bash

set -e

export PGHOST="${DB_HOST}"
export PGPORT="${DB_PORT}"
export PGUSER="${POSTGRES_USER}"
export PGPASSWORD="${POSTGRES_PASSWORD}"
export PGDATABASE="${POSTGRES_DB}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS ${POSTGRES_SCHEMA};

    SET search_path TO ${POSTGRES_SCHEMA};

    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
EOSQL

apply_migration() {
    local migration_file=$1
    local migration_version=$(basename "$migration_file" .sql)
    local applied=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -t -c "SELECT EXISTS(SELECT 1 FROM ${POSTGRES_SCHEMA}.schema_migrations WHERE version = '${migration_version}')")

    applied=$(echo "$applied" | xargs)

    if [ "$applied" = "f" ]; then
        echo "Applying migration: $migration_file"

        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration_file"

        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "INSERT INTO ${POSTGRES_SCHEMA}.schema_migrations (version) VALUES ('${migration_version}')"
    else
        echo "Migration $migration_version already applied. Skipping."
    fi
}


for file in $(find /migrations -name "*.sql" | sort); do
    apply_migration "$file"
done

echo "Database schema created successfully"