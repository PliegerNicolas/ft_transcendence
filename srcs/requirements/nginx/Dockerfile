# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/03/17 11:51:15 by nicolas           #+#    #+#              #
#    Updated: 2024/03/18 13:46:49 by nplieger         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.1

ENV FRONTEND_PORT=8080
ENV BACKEND_PORT=3450
ENV PORT=443

# Install NODE.JS and NPM.
RUN apk update && \
	apk add --no-cache \
		nginx \
	rm -f /var/cache/apk/*

# Create folder for nginx to store it's PID file
RUN mkdir -p /run/nginx && mkdir -p /etc/scripts

# Copy local ssl_certificates
COPY ./config/ssl_certificates /etc/nginx/ssl_certificates/

# Transfer configuration file
COPY ./tools/generate_nginx_conf.sh /etc/scripts/generate_nginx_conf.sh
COPY ./config/nginx.conf.template /etc/scripts/

# Generate nginx.conf with environment variables
ENTRYPOINT ["sh", "/etc/scripts/generate_nginx_conf.sh"]

# Expose port from .env
EXPOSE $PORT

# Run NPM.
CMD ["nginx", "-g", "daemon off;"]
