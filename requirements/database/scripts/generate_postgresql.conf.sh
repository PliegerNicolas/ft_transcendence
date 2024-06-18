#! /bin/sh

INPUT_FILE="/var/lib/postgresql/data/postgresql.conf.template";
OUTPUT_FILE="/var/lib/postgresql/data/postgresql.conf";

REQUIRED_ENV_VARS="PORT";
NOT_SET_ENV_VARS="";

echo "[i] Generating environment variable substitution command (with sed):"
JOINED_SEDS="";
for env_var_name in $REQUIRED_ENV_VARS; do
    env_var_value=$(printenv $env_var_name)

    if [ -z "$env_var_value" ]; then
	    NOT_SET_ENV_VARS="${NOT_SET_ENV_VARS} ${env_var_name}";
    else
        SED="-e 's/\${${env_var_name}}/${env_var_value}/g'"
        if [ -z "$JOINED_SEDS" ]; then
            JOINED_SEDS="sed $SED";
        else
            JOINED_SEDS="$JOINED_SEDS $SED";
        fi
    fi
done
echo "[i] > $JOINED_SEDS";

if [ -n "$NOT_SET_ENV_VARS" ]; then
    echo "[w] Missing environment variables: $NOT_SET_ENV_VARS"
    exit 1;
fi

echo "[i] Generating ${OUTPUT_FILE} by substituting environment variables from ${INPUT_FILE}";
eval "$JOINED_SEDS $INPUT_FILE > $OUTPUT_FILE";
