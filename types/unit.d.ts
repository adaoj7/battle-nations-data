/**
 * Battle Nations Data — public TypeScript types.
 *
 * The canonical record for each unit lives at:
 *   data/units/<id>.json
 *
 * The aggregated array lives at:
 *   data/units.json
 *
 * Public endpoints:
 *   https://data.bn-db.com/data/units.json
 *   https://data.bn-db.com/data/units/<id>.json
 *
 * These types describe the public dataset only. Application-only summaries
 * and enemy-faction extensions are not part of the public contract.
 */

export interface Resource {
  type: string;
  amount: number;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface PromotionCost {
  resources: Resource[];
  /** Time in seconds. */
  time: number;
  sp: number;
}

/** Damage resistances as percentages.
 *  100 = takes full damage, 50 = takes half, 0 = immune.
 *  Values above 100 mean the unit takes bonus damage of that type. */
export interface DamageResistances {
  crushing?: number;
  explosive?: number;
  fire?: number;
  cold?: number;
  piercing?: number;
  depthCharge?: number;
  torpedo?: number;
}

export interface UnitRank {
  rank: number;
  health: number;
  /** Separate armor pool (some units gain armor at higher ranks). */
  armor?: number;
  bravery: number;
  defense: number;
  dodge: number;
  abilitySlots: number;
  range: number;
  pvpValue: number;
  /** SP gained when defeating this unit. */
  spReward: number;
  /** Gold gained when defeating this unit. */
  goldReward: number;
  /** Cost to reach this rank. Undefined for rank 1. */
  promotionCost?: PromotionCost;
  /** Per-rank resistances (override unit-level when present). */
  resistances?: {
    hp?: DamageResistances;
    armor?: DamageResistances;
  };
}

export interface ActionRank {
  rank: number;
  damage?: NumericRange;
  offense: number;
  criticalChance: number;
  hits?: number;
  /** Damage-over-time per turn (scales per rank).
   *  Two shapes: linear interpolation `{ initial, final }` or
   *  decay-style `{ damage, decayPerTurn }`. */
  dot?: { initial: number; final: number } | { damage: number; decayPerTurn: number };
  critVsSoldiers?: number;
  critVsVehicles?: number;
  critVsTanks?: number;
  critVsCritters?: number;
  critVsAir?: number;
  critVsInfected?: number;
  critVsShips?: number;
  critVsSubs?: number;
  critVsArtillery?: number;
  critVsBattleship?: number;
  critVsGunboat?: number;
}

/** Status effect applied by an attack. */
export interface StatusEffect {
  type: "Poison" | "Fire" | "Stun" | "Freeze" | "Breach";
  /** Percentage chance to apply (e.g., 60 = 60%). */
  chance: number;
  /** Duration in turns. */
  duration: number;
  /** DoT damage per turn (Poison/Fire). */
  damage?: NumericRange;
}

export interface UnlockCost {
  /** Time in seconds. */
  time: number;
  nanos?: number;
  gold?: number;
  resources?: Resource[];
}

/** Suppression reduces a unit's combat effectiveness when fired upon.
 *  Applied as: `base * multiplier + flat`. */
export interface SuppressionMod {
  multiplier?: number;
  flat?: number;
}

/** A tile in an attack pattern, positioned relative to the target.
 *
 *  Coordinate system:
 *    x = depth (increases away from the attacker)
 *    y = horizontal (positive = right from attacker's perspective)
 *    (0, 0) = the targeted tile
 *
 *  Use `damageMultiplier` for deterministic splash patterns.
 *  Use `weight` for random-targeting patterns. */
export interface PatternTile {
  x: number;
  y: number;
  /** Fraction of listed damage (1.0 = full). */
  damageMultiplier?: number;
  /** Per-hit probability of landing on this tile. */
  weight?: number;
  /** Probability of hitting this tile (0.0–1.0). */
  hitChance?: number;
}

export interface GridPattern {
  tiles: PatternTile[];
  /** Optional weighted random offsets applied before the tile shape. */
  randomCenter?: {
    offsets: { x: number; y: number; weight: number }[];
  };
}

/** Fallback for patterns too complex to model as grid tiles. */
export interface CustomPattern {
  type: "custom";
  description: string;
}

export type AttackPattern = GridPattern | CustomPattern;

/** Targeting and blocking interaction. */
export type LineOfFire =
  | "Direct"
  | "Direct (Fixed)"
  | "Direct (Random)"
  | "Precise"
  | "Precise (Fixed)"
  | "Precise (Random)"
  | "Indirect"
  | "Indirect (Fixed)"
  | "Indirect (Random)"
  | "Contact"
  | "Contact (Back)"
  | "Contact (Fixed)";

export interface UnitAction {
  name: string;
  description?: string;
  /** Damage type — Explosive, Piercing, Fire, Cold, Crushing, etc. */
  damageType: string;
  lineOfFire: LineOfFire;
  unlockRank?: number;
  /** -1 for unlimited. */
  ammo: number;
  ammoUsed: number;
  /** Rounds to reload. */
  reloadTime: number;
  /** Rounds after firing before the action can fire again. */
  cooldown: number;
  /** Additional weapon-specific cooldown. */
  weaponCooldown?: number;
  /** Rounds of windup before the attack fires. */
  prepTime?: number;
  range: NumericRange;
  /** Percentage of damage that bypasses armor (e.g., 25 = 25%). */
  armorPiercing?: number;
  statusEffect?: StatusEffect;
  suppressionMod?: SuppressionMod;
  areaEffect?: boolean;
  unlockCost?: UnlockCost;
  /** Map of unit-type keys (e.g., "soldier", "tank") to whether the action can target them. */
  targetableTypes: Record<string, boolean>;
  ranks: ActionRank[];
  pattern?: AttackPattern;
}

/** Top-level unit record. One per `data/units/<id>.json`. */
export interface Unit {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  /** Soldier, Vehicle, Tank, etc. */
  category: string;
  /** infantry, armored, air, naval, etc. */
  unitType: string;
  tags?: string[];
  /** Imperial, Raider, Infected, Frontier, TF2, etc. */
  affiliation: string;
  /** Barracks, Vehicle Factory, etc. */
  building: string;
  /** Minimum building level required. */
  buildingLevel?: number;
  /** Player level required to unlock. */
  unlockLevel: number;
  /** Cost to unlock the unit (one-time). */
  unlockCost?: Resource[];
  /** Production time in seconds at base building level. */
  productionTime: number;
  /** Per-unit production cost. */
  cost: Resource[];
  blocking?: "Full" | "Partial" | "None";
  maxRank: number;
  /** Status-effect immunities (e.g., "Stun", "Poison", "Fire", "Freeze"). */
  immunities?: string[];
  resistances?: {
    hp?: DamageResistances;
    armor?: DamageResistances;
  };
  /** Unit name spawned when this unit dies. */
  spawnOnDeath?: string;
  healCost?: {
    resources: Resource[];
    /** Time in seconds. */
    time: number;
  };
  stats: {
    ranks: UnitRank[];
  };
  actions: UnitAction[];
  specialAbilities?: string[];
  motto?: string;
}

/** Aggregated `data/units.json` is `Unit[]`. */
export type UnitDataset = Unit[];
