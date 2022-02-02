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
