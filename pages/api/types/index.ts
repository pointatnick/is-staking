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
};

export type Diamond = Nft & {
  isStaked: boolean;
  iceToCollect: number;
};

export type Serpent = Nft & {
  isStaked: boolean;
  lastPaired?: Date;
  icePerDay: number;
};

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
