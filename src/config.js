import { PublicKey, Connection } from '@solana/web3.js';

const config = {
  devnet: {
    rpcUrl:
      'https://spring-billowing-silence.solana-devnet.quiknode.pro/965b0d3f1f825076d38ac1fb05fae81366ce8ada/',
    iceTokenMintPublicKey: '3dymLByZmhxmf2quguTtaQmJhSdtJU3LDRkvZ6U7bBbh',
    serpentsCollection: 'TestSerpents',
    diamondsCollection: 'diamonds',
    pairsCollection: 'test_paired_serpents',
  },
  'mainnet-beta': {
    rpcUrl:
      'https://summer-wispy-frost.solana-mainnet.quiknode.pro/46b6a945d633bab9cac87a2f4771e395448811ad/',
    iceTokenMintPublicKey: 'icex2Fy2KtXjfiAAUEHLPHu7XKDLvwiyVUPP9PNpSkF',
    serpentsDb: 'InfinitySerpents',
    serpentsCollection: 'Serpents',
    diamondsDb: 'fancy_diamonds',
    diamondsCollection: 'diamonds',
    pairsCollection: 'paired_serpents',
  },
};
export const RPC_URL = config[process.env.SOLANA_NETWORK].rpcUrl;
export const CONNECTION = new Connection(
  config[process.env.SOLANA_NETWORK].rpcUrl,
  { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
);
export const ICE_TOKEN_MINT = new PublicKey(
  config[process.env.SOLANA_NETWORK].iceTokenMintPublicKey
);
export const DAO_PUBLIC_KEY = new PublicKey(
  'f6gjSSzNYV44aLs5ocmY19XtbovELJAf6w5DTLEjdBL'
);
export const DAO_ICE_TOKEN_ADDRESS = new PublicKey(
  '7bYLu5xNTsz1MaXnN4b3AzV5xYH7T2mDLGfzE6tChPFG'
);
export const BURN_ICE_TOKEN_ADDRESS = new PublicKey(
  'BZAdaZ9SjvRW1pyeSqBj3DbZbJWLoKhh7nwE9x1HA5AW'
);
export const METAPLEX_TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);
export const S3_KEY = config[process.env.SOLANA_NETWORK].s3RarityFile;
export const SERPENTS_DB = config[process.env.SOLANA_NETWORK].serpentsDb;
export const DIAMONDS_DB = config[process.env.SOLANA_NETWORK].diamondsDb;
export const SERPENTS_COLLECTION =
  config[process.env.SOLANA_NETWORK].serpentsCollection;
export const PAIRS_COLLECTION =
  config[process.env.SOLANA_NETWORK].pairsCollection;
export const DIAMONDS_COLLECTION =
  config[process.env.SOLANA_NETWORK].diamondsCollection;
