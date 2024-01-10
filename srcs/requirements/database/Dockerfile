# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 23:43:12 by nicolas           #+#    #+#              #
#    Updated: 2024/01/10 16:49:18 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #
# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.0

ENV LANG=en_US.utf8
ENV PGDATA=/var/lib/postgresql/data
ENV PG_RUN_DIR=/run/postgresql

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
RUN initdb -D $PGDATA

ENTRYPOINT ["sh", "/docker-entrypoint-initdb.d/init-db.sh"]

# Expose the default postgres port.
EXPOSE 5432

# Star the postgreSQL database.
CMD ["postgres", "-c", "listen_addresses=*"]
