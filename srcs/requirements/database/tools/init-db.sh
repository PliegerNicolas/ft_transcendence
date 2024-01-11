# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    init-db.sh                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/10 16:28:52 by nicolas           #+#    #+#              #
#    Updated: 2024/01/11 18:40:03 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #
#!/bin/sh

# Check the number of arguments passed to script.


# Launch PostgreSQL server.
if [ -f "$PGDATA/postmaster.pid" ]; then
	echo "A PostgreSQL server is running. Altering the current one..."
	SHUTDOWN_POSTGRES=false
else
	echo "No PostgreSQL server running. Initializing it up."
	SHUTDOWN_POSTGRES=true

	pg_ctl -D "$PGDATA" -o "-c listen_addresses='*'" -w start
	until pg_isready -h localhost -p 5432 -U postgres -d postgres
	do
	    echo "Waiting for PostgreSQL to start..."
 	   sleep 1
	done
fi

# Create the $POSTGRES_DB database
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'")
if [ -z "$DB_EXISTS" ]; then

	psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
		CREATE DATABASE "$POSTGRES_DB";
		ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';
	EOSQL

	echo "Database '$POSTGRES_DB' created."
else
	echo "Database '$POSTGRES_DB' already exists."
fi

# Create the $POSTGRES_USER.
USER_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_USER'")
if [ -z "$USER_EXISTS" ]; then

	psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
		CREATE USER "$POSTGRES_USER" WITH PASSWORD '$POSTGRES_PASSWORD';
	EOSQL

	echo "User '$POSTGRES_USER' created."
else
	echo "User '$POSTGRES_USER' already exists."
fi

# Give user ownership of database.
psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
	ALTER DATABASE "$POSTGRES_DB" OWNER TO "$POSTGRES_USER";
EOSQL
echo "Giving ownership of '$POSTGRES_DB' to '$POSTGRES_USER'."

if [ "$SHUTDOWN_POSTGRES" = true ]; then
	echo "Shutting down server..."
	pg_ctl stop -D "$PGDATA" -m smart -w
fi

exec "$@"
