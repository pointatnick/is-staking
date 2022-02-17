export type Diamond = {
  _id: string;
  name: string;
  mint: string;
  attributes: { trait_type: string; value: string }[];
  imageUrl: string;
  isStaked: boolean;
  lastStaked: Date | null;
  rarity: number;
  rank: number;
  iceToCollect: number;
  staker: string;
};

export type Serpent = {
  _id: string;
  name: string;
  mint: string;
  attributes: { trait_type: string; value: string }[];
  imageUrl: string;
  isStaked: boolean;
  lastStaked: Date | null;
  rarity: number;
  rank: number;
  icePerDay: number;
  staker: string;
};

/**
 * all PairedSerpents are staked
 * ICE calculation for a staked serpent:
 * from Serpent.lastStaked until PairedSerpent.lastPaired at solo rate
 * plus PairedSerpent.lastPaired until now at pair rate
 */
export type PairedSerpent = {
  _id: string;
  name: string;
  mint: string;
  attributes: { trait_type: string; value: string }[];
  imageUrl: string;
  isPaired: boolean;
  lastPaired: Date | null;
  rarity: number;
  rank: number;
  diamondMint: string;
  diamondRank: number;
  iceToCollect: number;
  staker: string;
};
