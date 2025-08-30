lint:
  pnpm nx run-many -t lint

fix:
  pnpm nx run-many -t lint --fix
  pnpm nx format:write

build:
  pnpm nx run-many -t build

graphql:
  npx prettier --write "**/*.gql"
