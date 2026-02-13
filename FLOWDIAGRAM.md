┌────────────────────┐
│ Company / Team │
│ (Tenant Signup) │
└─────────┬──────────┘
│
│ Register Tenant
│ (creates tenant + admin)
▼
┌────────────────────┐
│ TENANT │
│ (Company Space) │
└─────────┬──────────┘
│
│
▼
┌───────────────────────────────────────────┐
│ USERS │
│ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ ADMIN │ │ AGENT │ │ USER │ │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│ │ │ │ │
└───────┼──────────────┼──────────────┼─────┘
│ │ │
│ │ │
▼ ▼ ▼
┌───────────────────────────────────────────┐
│ AUTH SYSTEM │
│ │
│ Login → JWT Token │
│ Token contains: │
│ - userId │
│ - tenantId │
│ - role (ADMIN / AGENT / USER) │
└─────────┬─────────────────────────────────┘
│
│ Every API request
▼
┌───────────────────────────────────────────┐
│ REQUEST PIPELINE │
│ │
│ 1. Auth Middleware (JWT verify) │
│ 2. Tenant Middleware (tenantId match) │
│ 3. Role Middleware (permission check) │
│ 4. Controller Logic │
└─────────┬─────────────────────────────────┘
│
│
▼
┌───────────────────────────────────────────┐
│ TICKETS │
│ │
│ Ticket Fields: │
│ - title │
│ - description │
│ - status │
│ - priority │
│ - createdBy │
│ - assignedTo │
│ - tenantId │
│ - deletedAt (soft delete) │
└─────────┬─────────────────────────────────┘
│
│
▼
┌──────────────────────────────────────────┐
│ ROLE-BASED BEHAVIOR │
│ │
│ USER │
│ - Create ticket │
│ - View own tickets │
│ │
│ AGENT │
│ - View assigned tickets │
│ - Update ticket status │
│ │
│ ADMIN │
│ - View all tenant tickets │
│ - Assign tickets │
│ - Soft delete tickets │
│ - Manage users │
└─────────┬────────────────────────────────┘
│
│
▼
┌───────────────────────────────────────────┐
│ SOFT DELETE FLOW │
│ │
│ Delete Ticket → deletedAt = timestamp │
│ - Ticket hidden from UI │
│ - Data remains in DB │
│ - Admin can audit later │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ REAL-TIME UPDATES │
│ │
│ Via Socket.io Rooms: │
│ - {tenantId} (All members) │
│ - {tenantId}\_{ROLE} (Specific roles) │
│ │
│ Events Emitted: │
│ - ticket_created (to AGENT/ADMIN) │
│ - ticket_updated (to Tenant) │
│ - ticket_closed (to Tenant) │
│ - ticket_deleted (to Tenant) │
│ - notification (Personal per userId) │
└───────────────────────────────────────────┘
