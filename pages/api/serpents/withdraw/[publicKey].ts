import { SERPENTS_COLLECTION } from '../../../../src/config';
import { Filter, UpdateFilter } from 'mongodb';
import { Serpent } from '../../types';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function updateDiamondsForStaker(
  filter: Filter<Serpent>,
  update: UpdateFilter<Serpent>
) {
  const { serpentDb: db } = await connectToDatabase();
  await db.collection(SERPENTS_COLLECTION).updateMany(filter, update);
}
