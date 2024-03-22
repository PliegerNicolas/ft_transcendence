#!/bin/sh

TEMPLATE_FILE_PATH=/etc/scripts/nginx.conf.template
NGINX_CONF_FILE_PATH=/etc/nginx/nginx.conf

REQUIRED_VARS="DOMAIN_NAME BACKEND_PORT FRONTEND_PORT"

if [ ! -f "$TEMPLATE_FILE_PATH" ]; then
	echo "Error: ${TEMPLATE_FILE_PATH} doesn't exist."
	exit 1
fi

for var in $REQUIRED_VARS; do
    if [ -z "$(eval echo \$$var)" ]; then
        echo "Error: $var environment variable is not set or is empty"
        exit 1
    fi
done

echo "[i] Generating ${NGINX_CONF_FILE_PATH}"
cat ${TEMPLATE_FILE_PATH} |
		sed -e "s#\${DOMAIN_NAME}#${DOMAIN_NAME}#g" \
			-e "s#\${FRONTEND_PORT}#${FRONTEND_PORT}#g" \
			-e "s#\${BACKEND_PORT}#${BACKEND_PORT}#g" \
	> ${NGINX_CONF_FILE_PATH}
chown nginx:nginx ${NGINX_CONF_FILE_PATH}

exec "$@"
