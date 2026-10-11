# Moksha sitemap / WACRM packaging repository

This is a source/packaging repository, NOT a general runtime queue. Its WACRM Central packaging workflow may overlap with moksha_wordpress; identify which package consumers rely on before retiring or upgrading. Never publish customer details, credentials or secret bundles.

## Shared-stack update instructions
Source of truth: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit
When dependencies, runtime, APIs, OS, security advisories or upstream platforms change, verify actual installed/source versions against supported stable releases. Record dated evidence, compatibility, security, cost, approved target, tests and rollback in the master registry. Propose reviewable, minimal upgrades. Never silently change production, private data, business identities, payment/booking functionality, or high-cost CI. Keep separate brands and ventures isolated.


## Cross-project master-stack event reporting (active 11 October 2026)
Every material capability, integration, security fix, breaking API/dependency change or verified deployment must be reported to **MOKSHA MASTER**. Documentation only; it does not authorize any production change.

Preferred in an authorized ChatGPT Project: call the connected Supabase `public.submit_master_stack_change` function in project `saczglesalubroyaucqe` with a stable event key, repository/project, source HTTPS URL, change type, title, concise evidence-backed summary, source kind and version. No service credentials in Git. The private event inbox is synchronized into the Google master registry after source verification.

If using GitHub Copilot without the Supabase connector: add a `STACK CHANGE` block to the commit or PR description with type, scope, source version, deployed version only if verified, summary, evidence and rollback. A separate daily monitor checks the approved repositories for newly committed material changes.

Protocol: https://github.com/karanzing1992/engagement-core/blob/main/docs/MASTER_STACK_UPDATE_PROTOCOL.md
Master: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit

Never include customer records, account data, credentials, private chat excerpts or security keys. Do not claim newly written Git code is live. Review and approve deployment separately.
