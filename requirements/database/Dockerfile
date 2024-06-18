# Latest stable version of alpine linux image as of 16/06/2024
FROM alpine:3.20.0

# Set docker-compose build arguments
ARG	PORT=3400 \
	WL_ADDRS=${WL_ADDRS} \
	POSTGRES_DB=${POSTGRES_DB} \
	POSTGRES_USER=${POSTGRES_USER} \
	POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Set local build arguments
ARG	PGDATA='/var/lib/postgresql/data' \
	PGRUN='/run/postgresql' \
	PGSCRIPTS='/var/lib/postgresql/scripts'

# Add PGDATA to env variables independently of docker-compose
ENV	PGDATA=${PGDATA} \
	PGSCRIPTS=${PGSCRIPTS} \
	PORT=${PORT}

# Install dependencies
RUN apk update && \
    apk add --no-cache --virtual .build-deps \
        postgresql \
        postgresql-contrib && \
    rm -f /var/cache/apk/*

# Set permissions on data and socket directories
RUN mkdir -p ${PGDATA} ${PGRUN} ${PGSCRIPTS} && \
	chown -R postgres:postgres ${PGDATA} ${PGRUN} ${PGSCRIPTS} && \
	chmod 700 ${PGDATA} ${PGRUN} ${PGSCRIPTS}

# Set user
USER postgres

# Initializing PostgreSQL database cluster if needed
RUN	if [ -z "$(ls -A $PGDATA)" ]; then \
		initdb -D $PGDATA -E UTF8 --locale=en_US.utf8 || exit 1; \
	fi

# Transfer local configuration files to container
COPY ./conf/pg_hba.conf.template ./conf/postgresql.conf.template ${PGDATA}/
COPY ./scripts/generate_postgresql.conf.sh ./scripts/generate_pg_hba.conf.sh ./scripts/docker-entrypoint.sh ${PGSCRIPTS}/

ENTRYPOINT ["sh", "/var/lib/postgresql/scripts/docker-entrypoint.sh"]

# Expose given port
EXPOSE ${PORT}

CMD ["postgres"]
