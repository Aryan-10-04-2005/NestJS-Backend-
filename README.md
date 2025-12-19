# Multi-tenant Issue Management API

## Architecture Questions

### 1. How did you implement multi-tenancy in NestJS?
I implemented multi-tenancy using a **Request-Scoped Service** (`UserContextService`) and a **Middleware** (`TenantMiddleware`).
- The middleware extracts `x-org-id` from the request headers and populates the `UserContextService`.
- The `UserContextService` is injected into other services (like `IssuesService`), allowing them to access the current tenant's ID.
- All database queries automatically filter by `organizationId` using this context, ensuring logical isolation at the application level.

### 2. Where does authorization logic live (Guard vs Service) and why?
Authorization logic is split:
- **Guards (`RolesGuard`)**: Handle coarse-grained, route-level permissions (e.g., "Only ADMINs can DELETE"). This keeps controllers clean and declarative.
- **Service (`IssuesService`)**: Handles fine-grained, business-logic permissions (e.g., "MEMBERs cannot update status"). This is because these checks often depend on the specific data being modified or complex business rules that don't fit well in a generic Guard.

### 3. How would you prevent cross-organization data leaks in production?
- **Row-Level Security (RLS)**: Use Postgres RLS policies to enforce isolation at the database level, so even if the application code fails to filter, the DB will not return other tenants' data.
- **Automated Testing**: Comprehensive integration tests that specifically try to access cross-tenant data.
- **Global Scopes/Filters**: Use TypeORM's global scopes or a custom repository wrapper to automatically append `where organizationId = ?` to every query, reducing the risk of developer error.

### 4. What parts of this system would break or need redesign at scale (100,000 organizations)?
- **Database Performance**: A single shared database table for 100k orgs would become massive. Indexing `organizationId` helps, but eventually, we'd need **Database Sharding** (partitioning data by tenant across multiple DB instances).
- **Migration Times**: Running schema migrations on a single massive DB would be slow and risky.
- **Connection Limits**: If using a separate DB/Schema per tenant (another strategy), connection pooling would become a bottleneck.

### 5. What features did you intentionally skip due to time constraints and why?
- **Authentication**: As requested, I mocked auth. In a real app, I'd use JWTs and an Identity Provider (Auth0/Cognito).
- **Pagination**: `findAll` returns everything. At scale, this needs cursor-based pagination.
- **DTO Validation**: I added basic DTOs but didn't add comprehensive validation rules (e.g., max length, specific status enums).
- **Unit Tests**: Skipped to focus on feature implementation and manual verification.
