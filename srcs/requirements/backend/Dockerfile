# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 20:08:41 by nicolas           #+#    #+#              #
#    Updated: 2024/01/12 16:15:53 by nplieger         ###   ########.fr        #
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
ENV PORT=3450

# Expose port 3450.
EXPOSE 3450

# Run NPM.
CMD ["npm", "run", "start:dev"]
# START:DEV IS TEMPORARY FOR DEVELOPMENT PURPOSE
