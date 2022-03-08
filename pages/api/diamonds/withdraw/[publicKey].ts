import { Diamond } from '../../types';
import { Filter, UpdateFilter } from 'mongodb';
import { DIAMONDS_COLLECTION } from '../../../../src/config';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function updateDiamondsForStaker(
  filter: Filter<Diamond>,
  update: UpdateFilter<Diamond>
) {
  const { diamondDb: db } = await connectToDatabase();
  //@ts-ignore
  await db.collection(DIAMONDS_COLLECTION).updateMany(filter, update);
}
