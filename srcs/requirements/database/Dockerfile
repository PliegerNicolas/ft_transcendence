# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: julboyer <julboyer@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 23:43:12 by nicolas           #+#    #+#              #
#    Updated: 2024/02/19 11:40:32 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19.0

ENV LANG=en_US.utf8
ENV PG_RUN_DIR=/run/postgresql
ARG PGDATA
ARG PORT

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

# Copy host-based authentification configuration file.
COPY /conf/pg_hba.conf $PGDATA/

ENTRYPOINT ["sh", "/docker-entrypoint-initdb.d/init-db.sh"]

# Expose the default postgres port.
EXPOSE $PORT

# Run postgres as given user.
CMD ["postgres", "-c", "listen_addresses=*"]
