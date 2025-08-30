# export SERVICE_NAME=
# export HIVE_ENDPOINT=
# export HIVE_TOKEN=
pnpm hive schema:publish "graphqls/$SERVICE_NAME/schema.gql" \
  --registry.accessToken "$HIVE_TOKEN" \
  --target "$HIVE_TARGET" \
  --service "$SERVICE_NAME" \
  --url "http://$SERVICE_NAME:3000/graphql"
