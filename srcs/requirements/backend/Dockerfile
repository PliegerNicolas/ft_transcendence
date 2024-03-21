# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 20:08:41 by nicolas           #+#    #+#              #
#    Updated: 2024/03/21 15:04:22 by mlaneyri         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Latest stable version of alpine linux at 17 mars 2024.
FROM alpine:3.19.1

ENV PORT=3450
ENV DB_PORT=3400

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

# Expose port from .env file
EXPOSE $PORT

# Run NPM.
CMD ["npm", "run", "start"]
# START:DEV IS TEMPORARY FOR DEVELOPMENT PURPOSE
