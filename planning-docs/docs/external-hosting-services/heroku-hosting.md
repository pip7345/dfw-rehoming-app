# Heroku Hosting

## Overview
Evaluation of Heroku as hosting for DFW Rehoming: Node.js runtime with managed Postgres, suitable for personal projects and small applications.

## Platform Summary
- Dynos are container instances that run app code. Multiple sizes are available under different plans.
- Managed data services include Postgres, a key value store, and Apache Kafka.
- Git based deploys with a managed build pipeline and per second prorated billing on usage.
- Custom domains with managed TLS, health checks, and zero downtime deploys.

## Postgres Snapshot
- Multiple Postgres plans exist with varying performance, storage, and features.
- Higher tiers add backups, point in time recovery, and high availability.
- The ecosystem includes add ons via the Elements Marketplace.

## Pros
- Mature managed Postgres with a long track record.
- Straightforward Node runtime environment and extensive documentation.
- Zero downtime deploys and instant rollbacks support safe releases.
- Add on marketplace offers many plug and play integrations.
- Private spaces and enterprise features available if the project grows.

## Cons
- Free and entry tiers have limited resources and fewer data protection features.
- Some advanced features require enterprise level plans.
- Pricing may be higher than newer hosts targeting personal projects.
- Regional constraints and network egress costs can apply depending on architecture.

## Suitability for DFW Rehoming
For fewer than 100 daily hits, a small dyno and entry level Postgres plan can support a minimal API and website. Costs may exceed strict zero dollar targets, so compare with alternatives that offer long term free tiers.

## Recommendation
- If strict zero dollar budget is required, consider Neon or Supabase for Postgres on a free tier and host the app on a low cost dyno only when needed.
- If a small monthly budget is acceptable, choose a low cost dyno and a basic Postgres plan, and enable automated backups.
- Keep images external to minimize storage and focus queries for fast response times.

## Next Actions
1. Compare Heroku Postgres entry plans with Neon and Supabase on limits and retention.
2. Estimate monthly cost under fewer than 100 hits per day.
3. Prototype deployment on a small dyno and measure latency.
4. Decide whether to use add ons from the marketplace for caching or observability.
