# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: julboyer <julboyer@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/08 19:32:44 by nicolas           #+#    #+#              #
#    Updated: 2024/03/22 12:59:25 by nplieger         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# **************************************************************************** #
# *                              GENERAL INFO                                * #
# **************************************************************************** #

NAME			:=			transcendence

# **************************************************************************** #
# *                                 DOCKER                                   * #
# **************************************************************************** #

COMPOSE				:=			docker-compose
BUILD               :=			docker build -t
COMPOSE_FILE		:=			./docker-compose.yml
REQUIREMENTS_PATH	:=			./requirements

# **************************************************************************** #
# *                                FUNCTIONS                                 * #
# **************************************************************************** #

define build_volume_folders
	mkdir -p "${HOME}/data/postgresql"
	mkdir -p "${HOME}/data/uploads"
endef

define build_images
	${BUILD} nginx ${REQUIREMENTS_PATH}/nginx
	${BUILD} database ${REQUIREMENTS_PATH}/database
	${BUILD} frontend ${REQUIREMENTS_PATH}/frontend
	${BUILD} backend ${REQUIREMENTS_PATH}/backend
endef

# **************************************************************************** #
# *                                  RULES                                   * #
# **************************************************************************** #

all:	up

up:
	$(call build_volume_folders)
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down --volumes --remove-orphans
	docker volume prune -f

re:		clean up

prune:
	docker system prune -af

.PHONY: up clean re prune
