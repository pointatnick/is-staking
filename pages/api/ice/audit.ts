import { OptionalUnlessRequiredId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { connectToDatabase } from '../../../lib/mongodb';
import { IceAudit } from '../types';

export async function insertClaimIceAudit(
  document: OptionalUnlessRequiredId<IceAudit>
) {
  const { serpentDb } = await connectToDatabase();
  await serpentDb.collection('ice_audit').insertOne(document);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: boolean }>
) {
  if (req.method === 'POST') {
    // write mongo audit with how much was sent to which address at what time
    let iceAudit: OptionalUnlessRequiredId<IceAudit> = {
      staker: req.body.publicKey,
      iceCollected: req.body.ice,
      txId: req.body.tx,
      date: new Date(),
    };

    await insertClaimIceAudit(iceAudit);
  } else {
    res.status(404);
  }
}
