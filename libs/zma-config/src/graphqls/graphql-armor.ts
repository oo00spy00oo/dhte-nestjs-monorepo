import { EnvelopArmor } from '@escape.tech/graphql-armor';

// Enhanced GraphQL security configuration
const armor = new EnvelopArmor({
  maxDepth: {
    n: 10,
  },
  costLimit: {
    maxCost: 1000,
  },
  maxTokens: {
    n: 1000,
  },
  maxAliases: {
    n: 15,
  },
  maxDirectives: {
    n: 50,
  },
});

export { armor };
