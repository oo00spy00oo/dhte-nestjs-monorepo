# zms-user

# Schema

## User

| Field           | Type      | Description                                                     |
| --------------- | --------- | --------------------------------------------------------------- |
| \_idid          | string    | Unique identifier for the user                                  |
| email           | string    | User's email address (optional if using social login or zaloId) |
| password        | string    | Hashed password (optional if using social login or zaloId)      |
| zaloId          | string    | Unique Zalo ID for authentication (optional)                    |
| firstName       | string    | User's first name                                               |
| lastName        | string    | User's last name                                                |
| type            | enum      | User type ('Admin', 'User', 'Zalo')                             |
| status          | enum      | Account status ('Active', 'Inactive', 'Suspended', 'Pending')   |
| tenantId        | string    | ID of the tenant this user belongs to                           |
| socialProviders | object    | Social login information                                        |
| createdAt       | timestamp | When the user was created                                       |
| updatedAt       | timestamp | When the user was last updated                                  |

### Social Providers Object

```json
{
  "google": {
    "id": "string",
    "email": "string",
    "accessToken": "string"
  },
  "facebook": {
    "id": "string",
    "email": "string",
    "accessToken": "string"
  }
}
```

## Authentication Methods

Users can authenticate using any of the following methods:

1. **Email/Password**

   - Traditional email and password authentication
   - Password must be hashed before storage

2. **Social Providers**

   - Google OAuth
   - Facebook OAuth
   - Stores provider-specific user IDs and tokens

3. **Zalo ID**
   - Authentication using Zalo platform
   - Requires valid zaloId

## Status Values

- `Active`: User account is active and can access the system
- `Inactive`: User account exists but cannot access the system
- `Suspended`: User account has been temporarily suspended
- `Pending`: User account awaiting activation/verification

## User Types

- `Admin`: System administrator with full access
- `User`: Regular user with standard permissions
- `Zalo`: Zalo user
- Other custom types as needed

## Tenant Relationship

Each user must belong to a tenant (organization). The `tenantId` field establishes this relationship and is used for:

- Data segregation
- Access control
- Organization-specific features

```

```
