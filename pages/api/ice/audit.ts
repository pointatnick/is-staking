import { Filter, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { clientPromise } from '../../../lib/mongodbv2';
import { SERPENTS_DB } from '../../../src/config';
import { IceAudit } from '../types';

const WITHDRAWAL_INTERVAL_HOURS = 24;
const ICE_AUDIT_COLLECTION = 'ice_audit';

export async function insertIceAudit(
  document: OptionalUnlessRequiredId<IceAudit>
) {
  const mongoClient = await clientPromise;
  const result = await mongoClient
    .db(SERPENTS_DB)
    .collection(ICE_AUDIT_COLLECTION)
    .insertOne(document);
  return result.insertedId;
}

export async function deleteIceAudit(filter: Filter<IceAudit>) {
  const mongoClient = await clientPromise;
  await mongoClient
    .db(SERPENTS_DB)
    .collection(ICE_AUDIT_COLLECTION)
    .deleteOne(filter);
}

export async function getMostRecentAudit(publicKey: string, claimType: string) {
  const mongoClient = await clientPromise;
  const d = new Date();
  const boundary = new Date(
    d.setHours(d.getHours() - WITHDRAWAL_INTERVAL_HOURS)
  );
  const cursor = mongoClient
    .db(SERPENTS_DB)
    .collection(ICE_AUDIT_COLLECTION)
    .find<IceAudit>({
      staker: publicKey,
      claimType,
      date: { $gte: boundary },
    });
  const results = await cursor.toArray();
  cursor.close();
  return results[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // check if publicKey had audit 24hrs ago
    const publicKey = req.body.publicKey;
    const claimType = req.body.type;
    const audit = await getMostRecentAudit(publicKey, claimType);

    if (audit) {
      const auditDate = new Date(audit.date);
      const MILLISECONDS_PER_DAY = 86400000;
      const now = Date.now();
      const remainingTime =
        MILLISECONDS_PER_DAY -
        (now -
          Date.UTC(
            auditDate.getUTCFullYear(),
            auditDate.getUTCMonth(),
            auditDate.getUTCDate(),
            auditDate.getUTCHours(),
            auditDate.getUTCMinutes(),
            auditDate.getUTCSeconds(),
            auditDate.getUTCMilliseconds()
          ));
      return res.status(200).json({ userCanWithdraw: false, remainingTime });
    }

    // write mongo audit with how much was sent to which address at what time
    const iceAudit: OptionalUnlessRequiredId<IceAudit> = {
      staker: publicKey,
      claimType,
      iceCollected: req.body.ice,
      date: new Date(),
    };

    const auditId = await insertIceAudit(iceAudit);
    return res.status(200).json({ userCanWithdraw: true, auditId });
  }

  if (req.method === 'DELETE') {
    await deleteIceAudit({ _id: new ObjectId(req.body.auditId) });
    return res.status(200).json(null);
  }

  return res.status(404).json(null);
}
