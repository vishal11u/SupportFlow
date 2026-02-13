multi-tenant, role-based Customer Support Ticket System
(Zendesk-style backend) built with Node.js, Express, PostgreSQL, and Sequelize.

The explanation must clearly describe how the application works from
initial tenant registration to ticket resolution.

SYSTEM OVERVIEW:

- The system is multi-tenant (tenant-based SaaS).
- Each tenant represents a company or team.
- All data is isolated per tenant using tenantId.
- Users belong to exactly one tenant.
- Roles control access: ADMIN, AGENT, USER.
- Tickets use soft delete (data is never permanently removed).

EXPLAIN THE FLOW IN THE FOLLOWING ORDER:

1. Tenant Registration Flow
   - How a company signs up
   - How a tenant is created
   - How the first ADMIN user is automatically created
   - Why tenant creation is the root of data isolation

2. Authentication Flow
   - How users log in
   - How passwords are verified securely
   - How JWT tokens are generated
   - What data is stored inside the token (userId, tenantId, role)
   - Why the token is critical for tenant and role enforcement

3. Request Lifecycle
   - Step-by-step flow of every protected API request
   - Authentication middleware
   - Tenant isolation middleware
   - Role authorization middleware
   - Controller execution
   - Database query with tenant filtering

4. User Management Flow (ADMIN role)
   - How admins create users and agents
   - How roles are assigned
   - How users are tied to the same tenant
   - Why users cannot access other tenants’ data

5. Ticket Creation Flow (USER role)
   - How users create tickets
   - How tenantId and createdBy are automatically attached
   - Default ticket status and priority
   - How tickets remain visible only inside the tenant

6. Ticket Handling Flow (AGENT role)
   - How agents view assigned tickets
   - How ticket status transitions work
   - What actions agents are allowed and not allowed to perform

7. Admin Ticket Oversight Flow (ADMIN role)
   - How admins view all tickets within their tenant
   - How admins assign tickets to agents
   - How admins monitor ticket lifecycle

8. Soft Delete Flow
   - How ticket deletion works using soft delete
   - What happens in the database when a ticket is deleted
   - Why deleted tickets disappear from the UI
   - How admins can still access deleted tickets if needed

9. Role-Based Access Control (RBAC)
   - Clear explanation of what each role can do
   - How access is enforced at API level
   - Why RBAC is essential for security

10. Multi-Tenant Isolation Rule
    - Explain the golden rule of tenant isolation
    - Why every database query must include tenantId
    - How this prevents cross-tenant data leakage

11. End-to-End Example Scenario
    - A complete real-world example:
      A company signs up → admin created → users added →
      tickets created → agents resolve tickets →
      admin audits and closes tickets

IMPORTANT CONSTRAINTS:

- No data should ever leak across tenants
- No permanent deletes (soft delete only)
- Role checks must be enforced on every protected route
- The explanation must be clear, structured, and professional
- The flow should reflect real SaaS systems used in production

OUTPUT FORMAT:

- Use clear sections
- Use simple but professional language
- Explain the logic, not just the APIs
- Avoid code unless necessary
