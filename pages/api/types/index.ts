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
};

export type Diamond = Nft & {
  isStaked: boolean;
  lastStaked: Date | null;
  iceToCollect: number;
};

export type Serpent = Nft & {
  isStaked: boolean;
  lastStaked: Date | null;
  icePerDay: number;
};

/**
 * all PairedSerpents are staked
 * ICE calculation for a staked serpent:
 * from Serpent.lastStaked until PairedSerpent.lastPaired at solo rate
 * plus PairedSerpent.lastPaired until now at pair rate
 */
export type PairedSerpent = Nft & {
  lastPaired: Date | null;
  diamondMint: string;
  diamondRank: number;
  diamondImageUrl: string;
  diamondName: string;
  iceToCollect: number;
};

export type IceAudit = {
  staker: string;
  iceCollected: number;
  txId: string | undefined;
  date: Date;
};
