# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 19:52:38 by nicolas           #+#    #+#              #
#    Updated: 2024/03/16 21:44:44 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.0

ARG PORT

# Install NODE.JS and NPM.
RUN apk update && \
	apk add --no-cache \
		openssl \
		nodejs \
		npm && \
	rm -f /var/cache/apk/*

# Map /app as working directory in container.
WORKDIR /app

# General self-signed SSL certificates
RUN mkdir -p ssl_certificates && \
	openssl req -nodes -new -x509 \
		-keyout ssl_certificates/frontend_ssl.key \
		-out ssl_certificates/frontend_ssl.cert \
		-subj "/C=FR/ST=Île De France/L=Paris/O=42School/CN=localhost"

# Copy local package files to container and install those dependencies.
COPY ./app/package*.json ./
RUN npm install

# Copy the other local app files and build the application.
COPY ./app/ .
RUN npm run build

# Expose port.
EXPOSE $PORT

# Run NPM.
CMD ["npm", "run", "preview", "--", "--host"]
