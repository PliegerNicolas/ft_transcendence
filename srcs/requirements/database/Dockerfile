# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: julboyer <julboyer@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 23:43:12 by nicolas           #+#    #+#              #
#    Updated: 2024/01/10 13:54:48 by julboyer         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

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

RUN mkdir /run/postgresql && chown ${POSTGRES_USER}: /run/postgresql

USER $POSTGRES_USER

RUN initdb

CMD ["postgres"]
