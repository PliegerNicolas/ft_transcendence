#! /bin/sh

# This generates self-signed ssl certificates. They should only be used for testing purposes and never in production

DOMAIN_NAME="rishmor.42.fr"

openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=FR/ST=Paris/L=Paris/O=OrganizationName/OU=R&D Department/CN=${DOMAIN_NAME}" \
    -keyout ${DOMAIN_NAME}.key  -out ${DOMAIN_NAME}.crt
