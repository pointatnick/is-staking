export type Nft = {
  _id: string;
  name: string;
  mint: string;
  attributes: { trait_type: string; value: string }[];
  imageUrl: string;
  isPaired: boolean;
  rarity: number;
  rank: number;
  staker: string;
  tokenAccount: string;
  lastStaked?: Date;
  isMolting: boolean;
  isStaked: boolean;
};

export type Diamond = Nft & {
  iceToCollect: number;
  isUsedForTierOneMolt: boolean;
  hasEnergy: boolean;
};

export type Serpent = Nft & {
  lastPaired?: Date;
  icePerDay: number;
};

// export enum MoltTier {
//   Infinite = 'Infinite', // tier 1
//   Empowered = 'Empowered', // tier 2
//   Evolved = 'Evolved', // tier 3
//   Base = 'Base', // tier 4
// }

export enum EnergyCharged {
  Charged = 'yes',
  NotCharged = 'no',
}

/**
 * all PairedSerpents are staked
 * ICE calculation for a staked serpent:
 * from Serpent.lastStaked until PairedSerpent.lastPaired at solo rate
 * plus PairedSerpent.lastPaired until now at pair rate
 */
export type PairedSerpent = Nft & {
  lastPaired?: Date;
  diamondMint: string;
  diamondRank: number;
  diamondImageUrl: string;
  diamondName: string;
  iceToCollect: number;
};

export type IceAudit = {
  staker: string;
  claimType: string;
  iceCollected: number;
  date: Date;
};

// -Recharge will cost 50,000 $ICE for diamonds spent on Tier 1 Molting & is currently top 25 in rarity
// -Recharge will cost 15,000 $ICE for every other case.
export enum IceRechargePrice {
  Cheap = 15000,
  Expensive = 50000,
}
