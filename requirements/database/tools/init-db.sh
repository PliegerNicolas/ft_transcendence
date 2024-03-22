# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    init-db.sh                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/10 16:28:52 by nicolas           #+#    #+#              #
#    Updated: 2024/03/18 13:11:07 by nplieger         ###   ########.fr        #
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
	until pg_isready -h localhost -p $DB_PORT -U postgres -d postgres
	do
	    echo "Waiting for PostgreSQL to start..."
 	   sleep 1
	done
fi

# Create the $DB_NAME database
DB_EXISTS=$(psql -p $DB_PORT -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ -z "$DB_EXISTS" ]; then

	psql -p $DB_PORT -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
		CREATE DATABASE "$DB_NAME";
	EOSQL

	echo "Database '$DB_NAME' created."
else
	echo "Database '$DB_NAME' already exists."
fi

# Create the $POSTGRES_USER.
USER_EXISTS=$(psql -p $DB_PORT -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ -z "$USER_EXISTS" ]; then

	psql -p $DB_PORT -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
		CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';
	EOSQL

	echo "User '$DB_USER' created."
else
	echo "User '$DB_USER' already exists."
fi

# Give user ownership of database.
psql -p $DB_PORT -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
	ALTER DATABASE "$DB_NAME" OWNER TO "$DB_USER";
	GRANT CONNECT ON DATABASE "$DB_NAME" TO "$DB_USER";
EOSQL

echo "Giving ownership of '$DB_NAME' to '$DB_USER'."

if [ "$SHUTDOWN_POSTGRES" = true ]; then
	echo "Shutting down server..."
	pg_ctl stop -p $DB_PORT -D "$PGDATA" -m smart -w
fi

exec "$@"
