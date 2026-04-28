# battle-nations-data

Canonical Battle Nations unit data for public consumption and contribution.

## Repo purpose

- `data/units/*.json` is the canonical edit surface.
- `data/units.json` is generated from the per-unit files.
- `schemas/` holds validation contracts.
- `scripts/` holds build and validation helpers.
- `docs/` holds sourcing and review policy.

## Basic workflow

1. Edit a unit file in `data/units/`.
2. Run `pnpm build:units-index`.
3. Run `pnpm validate`.
4. Open a PR with source evidence.

## Consumption

- Latest hosted data: `https://data.bn-db.com/data/...`
- Pinned data: `https://cdn.jsdelivr.net/gh/<user>/battle-nations-data@<tag>/data/...`
