# Copilot Instructions

This document defines the **fixed constraints, structure, and expectations** for GitHub Copilot when contributing to this repository.  
Copilot is used to accelerate implementation, not to redesign the system.

All suggestions must comply with the guidance below.

---

## 1. Tech Stack

The technology stack is fixed and must not be changed or expanded.

### Backend
- .NET Web API (C#)
- PostgreSQL with PostGIS extension
- REST over HTTP

### Frontend
- React
- Standard web APIs (fetch)
- No additional frameworks or state libraries

### General
- GeoJSON is the spatial data format
- HTTP is the only communication mechanism between client and API

Do **not** suggest alternative stacks, frameworks, or architectural styles.

---

## 2. Files

Repository structure is fixed:

src/
api/ .NET Web API
client/ React client


Rules:
- No shared source code between `api` and `client`
- No server-side rendering of React
- No mixing of frontend and backend concerns
- Configuration files must remain minimal and explicit

Do not introduce additional top-level folders or restructure the repository.

---

## 3. Architecture

The system follows a **layered architecture** with strict boundaries.

[ Browser ]
|
[ React Client ]
|
[ .NET Web API ]
|
[ PostGIS Database ]

Architectural rules:
- The API is the **single source of truth**
- The client communicates with the API **only via HTTP**
- The client never accesses the database
- Geometry is handled server-side only
- Validation occurs at the API boundary

Do not introduce:
- Microservices
- Event-driven architecture
- WebSockets or SignalR
- Background processing

Deployment bundling is allowed, architectural coupling is not.

---

## 4. Domains

The domain model is intentionally minimal.

### Core Domain Entity

**Room**
- `room_id` (primary key)
- `geometry` (Polygon, PostGIS)
- `name`
- `usage`
- `notes`

Rules:
- Geometry is **read-only**
- The client must not create or modify geometry
- No additional domain entities
- No relationships, aggregates, or sub-domains

Do not invent new concepts, tables, or domain abstractions.

---

## 5. Style Guides

### General Principles
- Prefer clarity over cleverness
- Prefer explicit code over abstraction
- Prefer deletion over extension

### Backend (.NET)
- Simple controllers
- Explicit DTOs
- Minimal layering
- No CQRS, MediatR, or pipelines
- Validation is explicit and readable

### Frontend (React)
- Functional components only
- Standard React hooks
- No global state management
- No complex custom hooks
- Treat GeoJSON as opaque data

Avoid over-engineering or “best practice” patterns unless explicitly required.

---

## 6. Build Instructions

### Expectations
- The solution must build and run locally
- Errors should fail fast and clearly
- Setup steps should be minimal

### Constraints
- No container orchestration required
- No CI/CD pipelines required
- No environment-specific branching logic

Build and run instructions should remain simple and documented inline where necessary.

---

## Final Instruction to Copilot

If a suggestion:
- Expands scope
- Introduces new concepts
- Adds architectural complexity
- Violates any rule above

**Do not generate it.**

This artefact prioritises disciplined scope, clear boundaries, and demonstrable software engineering judgement.
