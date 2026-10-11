# Moksha sitemap / WACRM packaging repository

This is a source/packaging repository, NOT a general runtime queue. Its WACRM Central packaging workflow may overlap with moksha_wordpress; identify which package consumers rely on before retiring or upgrading. Never publish customer details, credentials or secret bundles.

## Shared-stack update instructions
Source of truth: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit
When dependencies, runtime, APIs, OS, security advisories or upstream platforms change, verify actual installed/source versions against supported stable releases. Record dated evidence, compatibility, security, cost, approved target, tests and rollback in the master registry. Propose reviewable, minimal upgrades. Never silently change production, private data, business identities, payment/booking functionality, or high-cost CI. Keep separate brands and ventures isolated.

## Cross-project master-stack event reporting — LIVE PROTOCOL (11 October 2026)
This repository participates in the shared MOKSHA MASTER technology registry. At completion of **material** features, fixes, integrations, security changes, runtime/dependency upgrades and verified deployments, use the **tested two-route synchronization method**. Treat this reporting duty as part of definition-of-done, not permission to deploy or change customer data.

**Route A — this GitHub repository (default):** Include `STACK CHANGE:` at the **start of the final commit subject** describing a real, material capability/technology change; detail verification, source vs live deployment, impacted components, versions, compatibility and rollback in the commit body. The independent Google Apps Script checks nine allowlisted repositories hourly and adds source-linked `[MASTER-GITHUB-CHANGE:repo:SHA]` entries to the master Google Doc. The script consumes **GitHub commits, not PR descriptions or ChatGPT messages**. If squash-merging, preserve the tag in the final commit message. Eligible conventional commits like `feat:` and `fix:` with changed code can also be detected. Do not label routine churn or generated output a stack change. Copilot-instruction-only changes are intentionally ignored by the collector.

**Route B — change outside GitHub:** If new verified behavior/configuration happens exclusively in WordPress, Google, Supabase or another connected service without a GitHub commit, authorized ChatGPT Projects may submit an idempotent, evidence-linked event via connected Supabase `public.submit_master_stack_change` (project `saczglesalubroyaucqe`). A **separate verified hourly Master Inbox Sync** publishes those events. Do not mistake Google Apps Script for the Supabase inbox publisher.

**Project separation & safety:** Do not include credentials, customer/guest data, private conversations or passwords. Code committed is NOT proof of production deployment; always label source-only vs verified live. Check releases/security, cost, compatibility, rollback, staging and backups before upgrades. StayCore PMS bookings require independent offsite backup and audited admin-only restore. Andaz Lifestyle Stay is an internal label; public brand is Andaz Vibe Stay - Arambol, Goa; keep tenant data separate.

**Canonical protocol:** https://github.com/karanzing1992/engagement-core/blob/main/docs/MASTER_STACK_UPDATE_PROTOCOL.md
**Worker details:** https://github.com/karanzing1992/engagement-core/blob/main/services/master-stack-worker/apps-script/README.md
**Master Doc:** https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit

**ChatGPT Project distinction:** These repository instructions guide agents working in this codebase. They are not automatically installed into separate ChatGPT Projects. Add the reusable project-level paragraph in the canonical protocol to those Projects' persistent Instructions when you need chat-native compliance.
