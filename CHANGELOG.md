# Changelog

All notable changes to this repo will be documented here.

## 2026-10-01

### Fixed

- `blocking` is now `"Full"` for 26 units. 23 of them had the invalid value
  `"Blocking"` (the wiki's name for full blocking), and Veteran, Puma and
  Gunboat were listed as `"Partial"` where both the Miraheze and Fandom wikis
  list them as full blocking. Affected IDs: 30, 71, 110, 199, 213, 221, 225,
  227, 230–235, 238, 239, 242, 243, 245, 247, 249, 252, 255–257, 260.
- `npm run validate` now rejects `blocking` values outside `Full`, `Partial`
  and `None`, matching `types/unit.d.ts`.
