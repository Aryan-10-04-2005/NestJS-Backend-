# Multi-Tenant Issue & Activity Management API

## Overview
This is a NestJS-based backend API for managing issues and activities in a multi-tenant environment. It enforces strict data isolation between organizations and implements role-based access control (RBAC).

## How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Server:**
    ```bash
    npm run start
    ```

3.  **Run Verification Script:**
    ```bash
    node verify.js
    ```

## Architectural Decisions & Answers

### 1. How multi-tenancy is implemented
Multi-tenancy is implemented using a **discriminator column strategy**.
-   Every entity (`Issue`, `ActivityLog`) has an `organizationId` column.
-   **Request Context**: A middleware (`TenantMiddleware`) extracts the `x-org-id` from the request headers and stores it in a scoped `UserContextService`.
-   **Data Isolation**: Service methods automatically inject the `organizationId` from the `UserContextService` into all database queries (`find`, `save`, `update`, `delete`). This ensures that a user can only interact with data belonging to their organization.

### 2. Where authorization logic lives and why
Authorization logic is distributed across **Guards** and **Service Layer**:
-   **Role-Based Access Control (RBAC)**:
    -   `RolesGuard`: Located in `src/common/guards/roles.guard.ts`. It checks if the user's role (extracted from headers) matches the required roles for an endpoint (decorated with `@Roles`). This prevents unauthorized access at the controller level.
    -   **Service-Level Checks**: Specific business rules (e.g., "Only ADMIN can update status") are enforced inside `IssuesService`. This is because some permissions depend on *what* is being updated (field-level security), which is harder to express with generic guards.
-   **Why?**: Guards provide a clean, declarative way to protect endpoints, while service-level checks handle complex, domain-specific authorization rules.

### 3. How cross-organization data leaks are prevented
-   **Scoped Service**: The `UserContextService` is request-scoped, ensuring that tenant information is unique to each request and cannot leak between concurrent requests.
-   **Explicit Filtering**: All database queries in `IssuesService` and `ActivityService` explicitly include `{ where: { organizationId: ... } }`.
-   **Middleware Enforcement**: The `TenantMiddleware` rejects any request that does not provide a valid `x-org-id`, ensuring no "anonymous" or "global" access is possible.

### 4. What would break at scale (100k organizations)
-   **Database Performance**: Using a single SQLite (or even a single Postgres) database with a discriminator column for 100k organizations would lead to massive tables. Indexing `organizationId` helps, but eventually, query performance would degrade.
-   **Migration Complexity**: Schema changes would affect all 100k organizations simultaneously, making maintenance risky and slow.
-   **No Connection Pooling Isolation**: A "noisy neighbor" (one active organization) could consume all database connections, slowing down the API for everyone else.
-   **Solution**: For high scale, we would move to **Database-per-Tenant** or **Schema-per-Tenant** strategies to physically isolate data and resources.

### 5. What features were skipped due to time constraints and why
-   **Real Authentication**: We trust the `x-user-id` and `x-user-role` headers. In production, this MUST be replaced with JWT validation (e.g., Auth0, Cognito, or Passport.js).
-   **Input Validation (Pipes)**: While DTOs exist, strict validation pipes (e.g., `ValidationPipe`) might not be fully configured for all edge cases.
-   **Pagination**: `findAll` returns all issues. With thousands of issues, this would crash. Pagination (limit/offset) is essential.
-   **Error Handling**: Global exception filters could be improved to return standardized error responses.
-   **Testing**: Unit tests are present but minimal. E2E tests would provide better confidence.
