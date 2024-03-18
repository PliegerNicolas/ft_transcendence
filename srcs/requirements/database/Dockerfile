# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: julboyer <julboyer@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 23:43:12 by nicolas           #+#    #+#              #
#    Updated: 2024/03/18 12:43:46 by nplieger         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.1

ENV LANG=en_US.utf8
ENV PG_RUN_DIR=/run/postgresql
ENV PGDATA=/var/lib/postgresql/data
ENV DB_PORT=3400

# POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB variables set in .env file

# Install postgresql
RUN apk update && \
	apk add --no-cache \
		postgresql \
		postgresql-client && \
	rm -f /var/cache/apk/*

COPY /tools/init-db.sh /docker-entrypoint-initdb.d/

RUN mkdir -p "$PGDATA" "$PG_RUN_DIR" && \
	chown -R postgres:postgres "$PGDATA" "$PG_RUN_DIR" && \
	chmod 700 "$PGDATA" "$PG_RUN_DIR" && \
	chmod +x /docker-entrypoint-initdb.d/init-db.sh

# Switch to postgres USER.
USER postgres

# Initialize the database with the postgres user.
RUN initdb -D $PGDATA && \
	echo "port = $DB_PORT" >> $PGDATA/postgresql.conf

# Copy host-based authentification configuration file.
COPY /conf/pg_hba.conf $PGDATA/

ENTRYPOINT ["sh", "/docker-entrypoint-initdb.d/init-db.sh"]

# Expose the default postgres port.
EXPOSE $DB_PORT

# Startup database on given port
CMD postgres -p $DB_PORT -c listen_addresses='*'
