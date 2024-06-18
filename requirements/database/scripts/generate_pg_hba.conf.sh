#! /bin/sh

INPUT_FILE="/var/lib/postgresql/data/pg_hba.conf.template";
OUTPUT_FILE="/var/lib/postgresql/data/pg_hba.conf";

if [ $# -ne 1 ]; then
	echo "[!] Strictly one argument is expected." >&2
	echo "[i] Usage: sh $0 'addr1 addr2 addr3 addr4' ...>" >&1
	exit 1
fi

WL_ADDRS=$1

echo $WL_ADDRS

echo "[i] Copy ${INPUT_FILE} as ${OUTPUT_FILE}."
cp ${INPUT_FILE} ${OUTPUT_FILE}

echo "[i] Append to ${OUTPUT_FILE} additionnal configuration."

echo "# Allow connexions from containers from Docker Network" >> ${OUTPUT_FILE}
for WL_ADDR in ${WL_ADDRS}; do
	echo "host    all             all		${WL_ADDR}	md5" >> ${OUTPUT_FILE}
done
echo ""
echo "# Reject all other connexions" >> ${OUTPUT_FILE}
echo "host    all             all             all                     reject" >> ${OUTPUT_FILE}

echo "[i] Generated ${OUTPUT_FILE} successfully.";
