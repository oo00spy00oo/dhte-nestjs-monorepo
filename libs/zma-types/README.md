# zma-types: Shared Type System

The **zma-types** library serves as the central type system for the ZMA NestJS monorepo, providing a unified collection of TypeScript interfaces, enums, GraphQL types, and validation schemas used across all microservices.

## 🎯 Purpose

This library ensures type consistency and reduces duplication across the entire ecosystem by providing:

- **Shared Enums**: Centralized enumeration types for domain concepts
- **GraphQL Types**: Input/output type definitions for GraphQL schemas
- **Common Interfaces**: Reusable interfaces and utility types
- **Service Contracts**: Type-safe service method signatures
- **Validation Schemas**: Predefined validation rules
- **Domain Models**: Entity definitions and data structures

## 📁 Library Structure

```
zma-types/
├── src/
│   ├── common/           # Common GraphQL inputs and outputs
│   │   ├── inputs/       # Standard input types (pagination, filters)
│   │   └── outputs/      # Standard output types (responses, metadata)
│   ├── enums/           # Domain enumeration types
│   ├── subjects/        # Service method signatures
│   ├── types/           # General TypeScript interfaces and utilities
│   ├── validator/       # Validation schemas and rules
│   └── services/        # Service-specific types
│       ├── inputs/      # Service input DTOs
│       ├── outputs/     # Service output DTOs
│       ├── models/      # Domain models and entities
│       └── mappers/     # Data transformation utilities
└── README.md
```

## 🚀 Key Features

### Type Safety

- Branded types for domain-specific values (UserId, TenantId, etc.)
- Strict validation with class-validator decorators
- Generic utility types for advanced type manipulation

### GraphQL Integration

- Comprehensive GraphQL input/output types
- Custom scalar types (JSON, Date)
- Pagination support (offset-based and cursor-based)
- Relay specification compatibility

### Multi-tenant Support

- Tenant-aware base classes and interfaces
- Organization-scoped operations
- Hierarchical data structures

### Developer Experience

- Extensive JSDoc documentation
- Type guards and utility functions
- Consistent naming conventions
- Error handling patterns

## 📚 Usage Examples

### Basic Type Import

```typescript
import {
  UserRole,
  CurrencyEnum,
  ServiceName,
  AuthenticatedUser,
} from '@zma-nestjs-monorepo/zma-types';
```

### GraphQL Input/Output

```typescript
import { Pagination, PaginatedResponse, BooleanGqlOutput } from '@zma-nestjs-monorepo/zma-types';

@Resolver()
export class UserResolver {
  @Query(() => PaginatedResponse(User))
  async getUsers(@Args('pagination') pagination: Pagination) {
    // Implementation
  }
}
```

### Service Communication

```typescript
import { UserServiceSubject, FindByIdInput } from '@zma-nestjs-monorepo/zma-types';

// Type-safe service communication
const user = await this.userService.send(UserServiceSubject.FindById, new FindByIdInput());
```

### Domain Models

```typescript
import { BaseEntity, TenantAwareEntity, CompleteEntity } from '@zma-nestjs-monorepo/zma-types';

interface User extends CompleteEntity {
  email: string;
  role: UserRole;
}
```

### Utility Types

```typescript
import { Result, ValidationResult, DeepPartial, NonNullable } from '@zma-nestjs-monorepo/zma-types';

// Type-safe result patterns
const result: Result<User, Error> = await createUser(userData);
if (isSuccess(result)) {
  console.log(result.data); // Type: User
}
```

## 🔧 Common Patterns

### Pagination

```typescript
// Offset-based pagination
const pagination = new Pagination();
pagination.skip = 0;
pagination.limit = 10;

// Cursor-based pagination
const cursorPagination = new CursorPagination();
cursorPagination.first = 10;
cursorPagination.after = 'cursor-value';
```

### Filtering and Sorting

```typescript
// Advanced filtering
const filter = new CommonFilter();
filter.createdAt = {
  from: new Date('2023-01-01'),
  to: new Date('2023-12-31'),
};

// Multi-field sorting
const sort: SortField[] = [
  { field: 'createdAt', direction: SortDirection.DESC },
  { field: 'name', direction: SortDirection.ASC },
];
```

### Error Handling

```typescript
import { ErrorCode, createGraphQLError } from '@zma-nestjs-monorepo/zma-types';

// Standardized error codes
throw createGraphQLError('User not found', ErrorCode.USER_NOT_FOUND, { userId: '123' });
```

## 🛠️ Development

### Building

```bash
nx build zma-types
```

### Testing

```bash
nx test zma-types
```

### Linting

```bash
nx lint zma-types
```

## 📖 Best Practices

### Type Definitions

1. Use branded types for domain-specific values
2. Prefer interfaces over classes for data structures
3. Use utility types for common patterns
4. Document all public interfaces with JSDoc

### GraphQL Types

1. Use descriptive field names and descriptions
2. Apply appropriate validation decorators
3. Follow Relay specification for connections
4. Implement proper error handling

### Enums

1. Use string enums for better debugging
2. Register GraphQL enums when needed
3. Provide utility functions for enum operations
4. Group related enums in the same file

### Service Contracts

1. Define clear subject patterns
2. Use typed input/output interfaces
3. Include proper validation
4. Document expected behavior

## 🔄 Migration Guide

When updating types that may break existing code:

1. Use `@deprecated` JSDoc tags for obsolete types
2. Provide migration paths in documentation
3. Maintain backward compatibility when possible
4. Communicate changes through changelog

## 🤝 Contributing

1. Follow existing naming conventions
2. Add comprehensive JSDoc documentation
3. Include unit tests for utility functions
4. Update this README for significant changes
5. Ensure all exports are properly organized

## 📄 License

This library is part of the ZMA NestJS monorepo and follows the same licensing terms.

---

**Generated with [Nx](https://nx.dev) - Enhanced for production use**
