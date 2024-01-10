# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 19:52:38 by nicolas           #+#    #+#              #
#    Updated: 2024/01/09 16:14:08 by mlaneyri         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.0

# Install NODE.JS and NPM.
RUN apk update && \
	apk add --no-cache \
		nodejs \
		npm && \
	rm -f /var/cache/apk/*

# Map /app as working directory in container.
WORKDIR /app

# Copy local package files to container and install those dependencies.
COPY ./app/package*.json ./
RUN npm install

# Copy the other local app files and build the application.
COPY ./app/ .
RUN npm run build

# Set environment variable for port
ENV PORT=8080

# Expose port 8080.
EXPOSE 8080

# Run NPM.
ENTRYPOINT ["/bin/sh", "-c", "npm run build && npm run preview -- --host"]