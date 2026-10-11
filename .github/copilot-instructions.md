# Moksha sitemap / WACRM packaging repository

This is a source/packaging repository, NOT a general runtime queue. Its WACRM Central packaging workflow may overlap with moksha_wordpress; identify which package consumers rely on before retiring or upgrading. Never publish customer details, credentials or secret bundles.

## Shared-stack update instructions
Source of truth: https://docs.google.com/document/d/1-dSumLKkhmpzqGF2P-4x5_ZNUh9JamH3ApfXv4y4EeM/edit
When dependencies, runtime, APIs, OS, security advisories or upstream platforms change, verify actual installed/source versions against supported stable releases. Record dated evidence, compatibility, security, cost, approved target, tests and rollback in the master registry. Propose reviewable, minimal upgrades. Never silently change production, private data, business identities, payment/booking functionality, or high-cost CI. Keep separate brands and ventures isolated.
