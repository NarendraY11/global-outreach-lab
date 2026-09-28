# Global Outreach Lab

A controlled global outreach research platform.

## Scope

This project is designed to build a high-quality, auditable contact universe from lawful/public professional sources, enrich organizations, validate contact records, enforce suppression rules, and provide experiment analytics.

The email sender is intentionally disabled in the foundation build until sending-domain authentication, provider configuration, and campaign compliance checks are in place.

## Planned stack

- React + Vite + TypeScript
- Supabase Postgres/Auth/Storage
- Vercel for the control plane
- Background worker for queued jobs
- Amazon SES for authenticated sending

## Design principles

1. Preserve source provenance for every contact.
2. Prefer public professional contact channels over private personal addresses.
3. Deduplicate before enrichment or sending.
4. Suppress bounces, complaints, and opt-outs before every send.
5. Keep discovery, personalization, sending, and analytics separately testable.
6. Never claim inbox placement can be guaranteed.
