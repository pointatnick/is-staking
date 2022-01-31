import { writeIceDataForDiamond } from '../../../src/data/repo';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mint } = req.body;
    res.status(200).json(await writeIceDataForDiamond(mint, 0, true));
  }
}
