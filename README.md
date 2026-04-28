# Battle Nations Data

Canonical, public unit data for the mobile game Battle Nations.

Per-unit JSON files at `data/units/<id>.json` are canonical. The aggregate
`data/units.json` is generated from them. A TypeScript declaration ships
alongside the data at `types/unit.d.ts`.

> Browse the dataset, schema, and quickstart at **[data.bn-db.com](https://data.bn-db.com)**.

---

## Quickstart

Fetch the aggregate:

```js
fetch("https://data.bn-db.com/data/units.json")
  .then((response) => response.json())
  .then((units) => console.log(units.length));
```

Fetch one unit:

```js
fetch("https://data.bn-db.com/data/units/1.json")
  .then((response) => response.json())
  .then((unit) => console.log(unit.name));
```

For a pinned historical version, use jsDelivr against a tag:

```
https://cdn.jsdelivr.net/gh/adaoj7/battle-nations-data@<tag>/data/units.json
```

## TypeScript

The full public type declaration lives at [`types/unit.d.ts`](./types/unit.d.ts).
Drop it into a project and import the `Unit` type directly:

```ts
import type { Unit } from "./types/unit.d.ts";

const units: Unit[] = await fetch("https://data.bn-db.com/data/units.json").then((r) => r.json());
```

## Schema

The shape is compact, but a few boundaries matter.

| Field group | Keys |
|---|---|
| **Identity & taxonomy** | `id`, `name`, `category`, `unitType`, `affiliation` — the main browse keys. |
| **Progression & economy** | `unlockLevel`, `building`, `buildingLevel`, `productionTime`, `cost` — describe acquisition. |
| **Stats by rank** | `stats.ranks[]` holds survivability and core performance values at each rank. |
| **Actions & attack data** | `actions[]` contains attack metadata, patterns, cooldowns, damage ranges, and per-rank tuning. |
| **Defenses & rules** | `resistances`, `immunities`, `blocking` describe combat interactions easy to miss in basic summaries. |
| **Canonical vs. generated** | `data/units/<id>.json` is canonical. `data/units.json` is generated. App-only summaries belong elsewhere. |

The JSON Schema for validation is at [`schemas/unit.schema.json`](./schemas/unit.schema.json).

## Explore

The interactive explorer at **[data.bn-db.com](https://data.bn-db.com)** lets you:

- Search and filter the full unit roster
- Inspect each unit's JSON shape inline
- Copy direct file URLs

It loads `data/units.json` from this repo directly — no API, no build step.

## Repo rules

- Edit per-unit files (`data/units/<id>.json`), not the generated aggregate.
- Bring source evidence with every correction.
- Treat image URLs as references; not all are guaranteed hosted assets in this repo.
- Schema cleanup is a separate workstream — preserve canonical field semantics in data PRs.

## Contribute

The dataset is community-maintained. Stat corrections, missing units, schema fixes, and TypeScript type updates are all welcome.

- **Open a pull request** — fix one unit's stats, add a missing status effect, correct a targeting rule.
- **File an issue** — report a wrong stat, a missing field, or a documentation gap.
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for required PR contents.

## Repo layout

```text
battle-nations-data/
├── data/
│   ├── units/<id>.json    # canonical per-unit files
│   └── units.json         # aggregate, generated from units/
├── types/
│   └── unit.d.ts          # public TypeScript declarations
├── schemas/
│   └── unit.schema.json   # JSON Schema for validation
├── docs/                  # sourcing, review, and rules policy
├── scripts/               # build, validation, and preview helpers
├── assets/                # styles + JS for the docs site
├── index.html             # docs site entry point
├── CONTRIBUTING.md        # contribution policy
└── CHANGELOG.md           # release history
```

## Workflow

For maintainers and contributors:

1. Edit a unit file in `data/units/`.
2. Run `pnpm build:units-index` to regenerate `data/units.json`.
3. Run `pnpm validate` to check the dataset against the schema.
4. Run `pnpm preview:docs` to preview the docs site locally.
5. Open a PR with source evidence.
