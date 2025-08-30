# zms-user

# Schema

## Tenant

| Field         | Type   | Description                                                           |
| ------------- | ------ | --------------------------------------------------------------------- |
| id            | string | Unique identifier for the tenant                                      |
| name          | string | Name of the tenant organization                                       |
| status        | enum   | Current status of the tenant (e.g., 'active', 'suspended', 'pending') |
| billingStatus | enum   | Current billing status (e.g., 'paid', 'overdue', 'trial')             |
| adminId       | string | ID of the user who is the administrator for this tenant               |
| createdAt     | Date   | Timestamp when the tenant was created                                 |
| updatedAt     | Date   | Timestamp when the tenant was last updated                            |

### Status Values

- `active`: Tenant is fully operational
- `suspended`: Tenant access has been temporarily suspended
- `pending`: Tenant is in the process of being set up
- `archived`: Tenant has been archived

### Billing Status Values

- `paid`: Account is current on payments
- `overdue`: Payment is past due
- `trial`: Using a trial account
- `cancelled`: Billing has been cancelled
