# export SERVICE_NAME=
# export HIVE_ENDPOINT=
# export HIVE_TOKEN=
pnpm hive schema:delete "$SERVICE_NAME" \
  --registry.accessToken "$HIVE_TOKEN"
