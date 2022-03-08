import { Filter, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { connectToDatabase } from '../../../lib/mongodb';
import { IceAudit } from '../types';

const WITHDRAWAL_INTERVAL_HOURS = 24;
const ICE_AUDIT_COLLECTION = 'ice_audit';

export async function insertIceAudit(
  document: OptionalUnlessRequiredId<IceAudit>
) {
  const { serpentDb } = await connectToDatabase();
  const result = await serpentDb
    .collection(ICE_AUDIT_COLLECTION)
    .insertOne(document);
  return result.insertedId;
}

export async function deleteIceAudit(filter: Filter<IceAudit>) {
  const { serpentDb } = await connectToDatabase();
  await serpentDb.collection(ICE_AUDIT_COLLECTION).deleteOne(filter);
}

export async function checkForRecentAudits(
  publicKey: string,
  claimType: string
) {
  const { serpentDb } = await connectToDatabase();
  const d = new Date();
  const boundary = new Date(
    d.setHours(d.getHours() - WITHDRAWAL_INTERVAL_HOURS)
  );

  const results = await serpentDb
    .collection(ICE_AUDIT_COLLECTION)
    .find({
      staker: publicKey,
      claimType,
      date: { $gte: boundary },
    })
    .toArray();

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
    const recentAudit = await checkForRecentAudits(publicKey, claimType);

    if (recentAudit) {
      const recentAuditDate = new Date(recentAudit.date);
      const MILLISECONDS_PER_DAY = 86400000;
      const now = Date.now();
      const remainingTime =
        MILLISECONDS_PER_DAY -
        (now -
          Date.UTC(
            recentAuditDate.getUTCFullYear(),
            recentAuditDate.getUTCMonth(),
            recentAuditDate.getUTCDate(),
            recentAuditDate.getUTCHours(),
            recentAuditDate.getUTCMinutes(),
            recentAuditDate.getUTCSeconds(),
            recentAuditDate.getUTCMilliseconds()
          ));
      res.status(200).json({ userCanWithdraw: false, remainingTime });
    } else {
      // write mongo audit with how much was sent to which address at what time
      const iceAudit: OptionalUnlessRequiredId<IceAudit> = {
        staker: publicKey,
        claimType,
        iceCollected: req.body.ice,
        date: new Date(),
      };

      const auditId = await insertIceAudit(iceAudit);
      res.status(200).json({ userCanWithdraw: true, auditId });
    }
  } else if (req.method === 'DELETE') {
    await deleteIceAudit({ _id: new ObjectId(req.body.auditId) });
    res.status(200).json(null);
  } else {
    res.status(404);
  }
}
