# Use Prisma as ORM

## Decision
Use Prisma as the Object-Relational Mapping (ORM) layer for database interactions.

## Context
The project requires a type-safe, migration-friendly ORM that works well with Node.js and Postgres. We need to manage schema migrations, seed data, and provide a clean API for CRUD operations.

## Rationale
- **Type Safety**: Auto-generated TypeScript types prevent runtime errors.
- **Migration Management**: Built-in migration tooling for schema changes.
- **Developer Experience**: Intuitive query API with autocompletion.
- **Postgres Support**: First-class support for Postgres features.
- **Active Community**: Well-maintained with extensive documentation.

## Alternatives Considered
- **Knex.js**: More low-level, requires manual type definitions.
- **TypeORM**: Complex API, slower adoption of modern TypeScript features.
- **Sequelize**: Less type-safe, older architecture.

## Consequences
- Positive: Faster development, fewer bugs, easier onboarding.
- Negative: Additional dependency, learning curve for team members unfamiliar with Prisma.
- Mitigation: Prisma documentation is excellent; team can ramp up quickly.

## Status
Accepted

## Date
November 28, 2025
