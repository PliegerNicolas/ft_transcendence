# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 20:08:41 by nicolas           #+#    #+#              #
#    Updated: 2024/03/17 12:02:03 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 17 mars 2024.
FROM alpine:3.19.1

ARG PORT

# Install NODE.JS and NPM.
RUN apk update && \
	apk add --no-cache \
		nodejs \
		npm \
		python3 \
		build-base && \
	rm -f /var/cache/apk/*

# Map /app as working directory in container.
WORKDIR /app

# Copy local package files to container and install those dependencies.
COPY ./app/package*.json ./
RUN npm install

# Copy the other local app files and build the application.
COPY ./app/ .
RUN npm run build

# Expose port 3450.
EXPOSE $PORT

# Run NPM.
CMD ["npm", "run", "start:dev", "--",  "--preserveWatchOutput"]
# START:DEV IS TEMPORARY FOR DEVELOPMENT PURPOSE
