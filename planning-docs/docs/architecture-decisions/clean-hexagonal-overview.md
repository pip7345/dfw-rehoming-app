---
title: Clean & Hexagonal Overview
description: Brief notes on Layered, Clean, and Hexagonal (Ports & Adapters) architectures with references and how our web/api/core split maps to them.
slug: clean-hexagonal-overview
---

## Goal

Separate concerns to keep core logic independent of UI and frameworks. Our split: `web` (UI), `api` (application services), `core` (domain + data access).

## Patterns

- Layered Architecture: presentation → application/service → domain/data.
- Clean Architecture: dependencies point inward; core does not depend on frameworks or DB.
- Hexagonal (Ports & Adapters): define ports in core; adapters implement UI/DB/external services.

## Mapping to Our Project

- `web`: EJS views and static assets; talks to `api` via HTTP.
- `api`: Express routes and use‑cases; imports `core` interfaces.
- `core`: Prisma client, repositories, domain types; no Express/UI code.

## References

- Clean Architecture (Uncle Bob): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Hexagonal Architecture (Cockburn): https://alistair.cockburn.us/hexagonal-architecture/
- Layered Architecture (Fowler): https://martinfowler.com/bliki/PresentationDomainDataLayering.html
