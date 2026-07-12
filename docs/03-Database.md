# PATHWISE DATABASE DESIGN

## Purpose

This document serves as the single source of truth for the database architecture of the Pathwise platform. It defines the business modules, database ownership, PostgreSQL entities, Neo4j graph design, relationships, constraints, and future database decisions.

This document focuses ONLY on how data is stored and managed.

---

# Business Modules

## Module 1 – Authentication

### Purpose

Manage user registration, login, authentication, authorization, and account security.

### Features

- User Registration
- User Login
- Google OAuth Login
- Forgot Password
- Password Reset
- Email Verification
- JWT Authentication
- Role-Based Access Control (RBAC)
- Secure Session Management

### User Input

- First Name
- Last Name
- Email Address
- Password
- Phone Number (Country Code + Number)

### System Managed

- User ID (UUID)
- Authentication Provider
- Email Verified
- Phone Verified (Future)
- User Role
- Account Status
- Last Login
- Created At
- Updated At

### PostgreSQL Entity

- Users

### Neo4j Nodes

None

### Relationships

User
└── Creates → Profile

### High-Level APIs

POST /auth/register

POST /auth/login

POST /auth/google

POST /auth/logout

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

PATCH /auth/update-password

### Notes

- Store passwords as hashed values.
- Use JWT Access & Refresh Tokens.
- Store phone numbers in E.164 format.
- Authentication is only responsible for identity and security.

---

# Data Ownership Matrix

| Data | Owner Module |
|------|--------------|
| First Name | Authentication |
| Last Name | Authentication |
| Email | Authentication |
| Password | Authentication |
| Phone Number | Authentication |

---

# Pending Modules

- Career Assessment Engine
- Career Intelligence
- Opportunity Explorer
- Skill Intelligence
- Learning Roadmap
- Resume Intelligence
- Progress Tracking
- AI Mentor
- Admin Dashboard

---

# Development Notes

The database will be designed module-by-module.

Each module will follow this structure:

Purpose

↓

Features

↓

User Input

↓

System Managed

↓

PostgreSQL Entity

↓

Neo4j Nodes

↓

Relationships

↓

High-Level APIs

↓

Notes

No SQL tables should be implemented until all modules are finalized.