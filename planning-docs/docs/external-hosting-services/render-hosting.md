# Render Hosting

## Overview
Evaluation of Render as hosting provider for DFW Rehoming (Node.js + Postgres, less than 100 hits/day, minimal cost).

## Service Features (Relevant)
- Free instance types for Web Service, Postgres, Key Value (Redis-compatible).
- Managed Postgres: connection from anywhere; paid tiers add backups, PITR, HA.
- Web services: Node runtime supported natively; also Docker option.
- Zero-downtime deploys + instant rollbacks.
- Git auto deploys + pipeline minutes (500/mo on Hobby).
- Background workers + cron jobs for async tasks, scheduled maintenance.
- Key Value cache to offload reads (free small tier) if needed later.
- HTTP/2 and HTTP/3 support, managed TLS, custom domains.
- Per-second prorated billing when scaling beyond free tiers.

## Free Tier Snapshot (From Pricing Page)
Web Service Free: 512MB RAM, 0.1 CPU.
Postgres Free: 256MB storage, 0.1 CPU equivalent, ~100 connections, 30-day limit (ephemeral for exploration), no backups.
Key Value Free: 25MB, 50 connections.

## Pros
- Native Postgres offering (structured relational DB) vs edge SQLite (D1) maturity.
- Straightforward Node environment (can use standard Node APIs, popular libraries without edge adaptations).
- Zero-downtime deploys reduce release risk.
- Instant rollbacks expedite recovery from bad deploys.
- Background workers & cron jobs enable later asynchronous features (e.g., cleanup, periodic archival) without new provider.
- Key Value cache available to reduce DB load if read scale increases.
- Autoscaling and vertical scaling path without re-platforming.
- Per-second prorated billing ensures efficient cost as we experiment.
- Git-based CI/CD minimal configuration.
- Supports Docker for custom OS-level dependencies (future flexibility).

## Cons / Limitations
- Free Postgres is time-limited (30-day) and lacks backups & PITR; risk of data loss if not migrated before expiration.
- No high availability or advanced recovery on free/basic tiers.
- Small RAM/CPU on free web service may constrain performance under spikes.
- Log retention only 7 days; limited observability for long-term audits.
- Potential need to attach a paid card early for continuity (avoid surprise expiration).
- Autoscaling / advanced networking features may require higher tier.
- Incremental per-user workspace fees at Professional level if team grows.
- Backup retention and expandable storage are paid only—must plan migration window.

## Suitability for DFW Rehoming
For an MVP with fewer than 100 daily hits and modest data volume, Render can host both the API and Postgres cheaply. The Postgres free 30-day limit means we must either:
1. Migrate to a paid Basic tier before day 30; or
2. Choose another persistent DB (e.g., Neon, Supabase) for long-term free retention.

Because continuous data (dog listings, submissions) must persist beyond 30 days, relying exclusively on the free ephemeral Postgres is risky unless we schedule early migration.

## Recommended Approach
- Start directly on a Basic Postgres plan (256MB) to avoid 30-day expiration risk (budget: $6/mo) OR evaluate Neon/Supabase if strictly $0 required.
- Use a Free Web Service initially; monitor memory/CPU. Upgrade to Starter ($9/mo) if performance degrades.
- Implement nightly export (SQL dump) to offsite storage (Git LFS private repo or object storage) before enabling paid backups.
- Keep schema lean to fit small storage: images stored externally (URLs only).

## Decision Factors vs Cloudflare Pages + D1
| Factor | Render | Cloudflare Pages + D1 |
| ------ | ------ | --------------------- |
| Runtime | Full Node | Edge (Workers runtime) |
| DB | Managed Postgres (mature) | SQLite-like (beta features) |
| Free DB Persistence | 30-day limit (free) | Persistent (size limits) |
| Deploy Method | Git auto deploy | Git auto deploy |
| Scaling | Vertical + autoscale | Edge global by default |
| Cron/Workers | Native background + cron | Scheduled Workers (separate) |
| Data Backup | Paid tiers only | Manual export scripts |

## Next Actions
1. Decide DB provider (Render Basic vs Neon vs Supabase) by comparing long-term free constraints.
2. If choosing Render Postgres, schedule migration/upgrade before free expiry.
3. Set up automated export script prior to production launch.
4. Draft environment variables & connection strategy.

---
*Refer back to Project Plan Milestone 1 for final hosting decision.*
