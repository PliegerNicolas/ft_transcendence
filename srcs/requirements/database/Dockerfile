# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nicolas <marvin@42.fr>                     +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 23:43:12 by nicolas           #+#    #+#              #
#    Updated: 2024/01/09 00:33:55 by nicolas          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #
# Latest stable version of alpine linux at 8 january 2024.
FROM alpine:3.19.0

ENV POSTGRES_USER=postgres
ENV POSTGRES_GROUP=postgres

RUN apk update && \
	apk add --no-cache postgresql

#RUN set -eux; \
#	addgroup -g 70 -S $POSTGRES_GROUP; \
#	adduser -u 70 -S -D -G $POSTGRES_GROUP -H -h /var/lib/postgresql -s /bin/sh $POSTGRES_USER; \
#	mkdir -p /var/lib/postgresql; \
#	chown -R $POSTGRES_USER:$POSTGRES_GROUP /var/lib/postgresql

ENV PGDATA=/var/lib/postgresql/data

EXPOSE 5432

USER $POSTGRES_USER

CMD ["postgres"]
