import { config as metaplexConfig } from '@metaplex-foundation/mpl-core';
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
      'https://summer-wispy-frost.solana-mainnet.quiknode.pro/9fde25b3e82544f07c8c045e4e56ae0c30b322d0/',
    iceTokenMintPublicKey: 'icex2Fy2KtXjfiAAUEHLPHu7XKDLvwiyVUPP9PNpSkF',
    serpentsCollection: 'Serpents',
    diamondsCollection: 'diamonds',
    pairsCollection: 'paired_serpents',
  },
};
export const RPC_URL = config[process.env.SOLANA_NETWORK].rpcUrl;
export const CONNECTION = new Connection(
  config[process.env.SOLANA_NETWORK].rpcUrl,
  { commitment: 'confirmed' }
);
export const ICE_TOKEN_MINT = new PublicKey(
  config[process.env.SOLANA_NETWORK].iceTokenMintPublicKey
);
export const DAO_PUBLIC_KEY = new PublicKey(
  'f6gjSSzNYV44aLs5ocmY19XtbovELJAf6w5DTLEjdBL'
);
export const METAPLEX_TOKEN_PROGRAM_ID = new PublicKey(
  metaplexConfig.programs.token
);
export const S3_KEY = config[process.env.SOLANA_NETWORK].s3RarityFile;
export const SERPENTS_COLLECTION =
  config[process.env.SOLANA_NETWORK].serpentsCollection;
export const PAIRS_COLLECTION =
  config[process.env.SOLANA_NETWORK].pairsCollection;
export const DIAMONDS_COLLECTION =
  config[process.env.SOLANA_NETWORK].diamondsCollection;
