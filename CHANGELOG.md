# Changelog

All notable changes to this repo will be documented here.

## 2026-10-10

### Changed

- Unit stats updated for the 4.19.0 patch (Oct 9): health for Field Agent,
  Battle Raptor, Light Tank, Mini Tank, Mortar Truck, Imperial Boar and Nomad
  Elemental Rover; armor for Light Tank, Mini Tank and Riot Trooper. Nomad's
  EMP Grenade ammo goes from 2 to 1 and its description notes it leaves units
  at 10% health instead of killing them. IDs: 14, 36, 53, 58, 65, 96, 98, 246.
- Unit stats updated for the 4.17.7 patch (Aug 13):
  - promotions for Trooper, Shock Trooper, Mortar Team, Arsonist, Hunter,
    Gunner, Heavy Grenadier, Imperial Dragoon, Riot Trooper and Flame Trooper:
    timers cut to a quarter, Bars and Laurels removed, other costs halved;
  - Trooper Battle Rifle and Double Shot base damage 22-26 → 26-31;
  - Shock Trooper Controlled Burst crit 13% → 33%;
  - Arsonist Firestarter (the Molotov Cocktail) base damage 12-18 → 15-22;
  - Hunter: all attacks range 1-4, damage now scales 20% per rank;
  - Gunner HP 70/80/90/100/110/120, Machine Gun and Heavy Fire line of fire
    Precise (Fixed);
  - Imperial Dragoon Big Swing base damage 29-35 → 44-53 with a 25% stun for
    1 turn, Stun Sweep base damage 14-17 → 22-26 and stun chance 60% → 70%;
  - Riot Trooper Buckshot base damage 5-6 → 8-9;
  - Spray Flame fire chance 60% → 100% on Flame Trooper, Salamander and
    Firedrake.
- Nomad Elemental Rover unlock level 10 → 35 (4.17.9 patch).

### Fixed

- Promotion SP for Mortar Team, Heavy Grenadier and Imperial Dragoon now
  matches the wiki.

## 2026-10-01

### Added

- 18 Boss Strike reward units (IDs 267–284): AD7 Bigfoot SkyBus, Attack Drone,
  B10 Wild Boar, B10-C Boar II, C17 Winged Mammoth, F-51 Hell Fire, Falcon's Nest,
  Flying Dexter Fragment, Minelayer Destroyer, Mini Sub, Navy Trooper,
  RS-B17 Shadow Hornet, RS17 Shadowwasp, Signal Jamming Drone,
  Silverwolf Crop Buster, Tri-Wing Terror, UD-4L Gunship and Apex Bullfrog.

### Fixed

- `blocking` is now `"Full"` for 26 units. 23 of them had the invalid value
  `"Blocking"` (the wiki's name for full blocking), and Veteran, Puma and
  Gunboat were listed as `"Partial"` where both the Miraheze and Fandom wikis
  list them as full blocking. Affected IDs: 30, 71, 110, 199, 213, 221, 225,
  227, 230–235, 238, 239, 242, 243, 245, 247, 249, 252, 255–257, 260.
- `npm run validate` now rejects `blocking` values outside `Full`, `Partial`
  and `None`, matching `types/unit.d.ts`.
- Attack patterns corrected for 71 units after checking every attack against
  the wiki damage GIFs:
  - swapped or mirrored axes (e.g. Tactical Submarine Mini Rockets, Shredder
    Swipe, Ironclad and Raptor-Class Bombard);
  - area attacks that cover the whole field or a full row (e.g. Field Agent
    EMP Burst / Nerve Gas, Heavy Mow Down, Scout Bike Backfire);
  - checkerboard attacks now use the 19-tile checker (e.g. Rocket Truck and
    Brimstone Checker Strike, Shadow Agent Heat Seekers);
  - random-hit attacks now use `randomCenter` instead of a fixed area (e.g.
    Radio Tech Scattered Strike, Plasma Tank Plasma Fissure, Zombie Hunter
    Double Tap);
  - plus shapes that are X shapes in game (e.g. Heavy Grenadier X Strike,
    Demoman Fire Grenade);
  - missing, malformed or misplaced tiles (e.g. Gunner Anti-Air Spray, Heavy
    Gunner Anti-Air Wide Spray, Unicorn Trooper Doombow, Apex Bullfrog Weak
    Cough).
