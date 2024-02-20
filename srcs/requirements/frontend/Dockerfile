# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 19:52:38 by nicolas           #+#    #+#              #
#    Updated: 2024/02/19 11:40:39 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.0

ARG PORT

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

# Expose port.
EXPOSE $PORT

# Run NPM.
CMD ["sh", "-c", "npm run build && npm run preview -- --host"]
