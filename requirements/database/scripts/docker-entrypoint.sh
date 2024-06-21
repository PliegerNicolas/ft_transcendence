# Function to initialize PostgreSQL database and user
initialize_database() {
    echo "[i] Initialize database(s) and user(s)."
    pg_ctl -w start

    if [ -z "$(psql -p $PORT -XtAc 'SELECT 1 FROM pg_user WHERE usename != '\''postgres'\''')" ]; then
        psql -p $PORT -c "CREATE USER \"$POSTGRES_USER\" WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';"
        
        if [ -z "$(psql -p $PORT -XtAc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'")" ]; then
            psql -p $PORT -c "CREATE DATABASE \"$POSTGRES_DB\" WITH OWNER \"$POSTGRES_USER\";"
            psql -p $PORT -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
        fi
    fi

    pg_ctl -w stop -m fast
}

# Execute script to generate postgresql.conf and pg_hba.conf files
echo "[i] Executing ${PGSCRIPTS}/generate_postgresql.conf.sh"
sh ${PGSCRIPTS}/generate_postgresql.conf.sh

echo "[i] Executing ${PGSCRIPTS}/generate_pg_hba.conf.sh ${WL_ADDRS}"
sh ${PGSCRIPTS}/generate_pg_hba.conf.sh ${WL_ADDRS}

# Setup $POSTGRES_DB
initialize_database

echo "[i] Remove ${PGSCRIPTS}"
rm -f ${PGSCRIPTS}/generate_postgresql.conf.sh
rm -f ${PGSCRIPTS}/generate_pg_hba.conf.sh

exec "$@"
