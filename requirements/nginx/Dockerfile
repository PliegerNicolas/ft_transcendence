# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/03/17 11:51:15 by nicolas           #+#    #+#              #
#    Updated: 2024/03/20 00:27:20 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.1

ENV FRONTEND_PORT=8080
ENV BACKEND_PORT=3450
ENV PORT=443
ARG NGINX_VERSION="1.21.4"

# Install NODE.JS and NPM.
RUN apk update && \
	apk add --no-cache \
		build-base \
		pcre-dev \
		openssl-dev \
		zlib-dev \
		wget \
	rm -f /var/cache/apk/*

# Create nginx user and group
RUN addgroup -S nginx && adduser -S -D -H -h /usr/local/nginx -s /sbin/nologin -G nginx nginx

# Install and compile NGINX with extra plugins
RUN wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
	tar -xzvf nginx-${NGINX_VERSION}.tar.gz && \
	cd nginx-${NGINX_VERSION} && \
	./configure --prefix=/var/www/html \
		--sbin-path=/usr/sbin/nginx \
		--conf-path=/etc/nginx/nginx.conf \
		--http-log-path=/var/log/nginx/access.log \
		--error-log-path=/var/log/nginx/error.log \
		--with-pcre  \
		--lock-path=/var/lock/nginx.lock \
		--pid-path=/var/run/nginx.pid \
		--with-http_ssl_module \
		--with-stream && \
	make && make install && \
	cd .. && rm -r nginx-${NGINX_VERSION}*

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
