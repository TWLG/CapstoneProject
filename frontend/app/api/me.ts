import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
const token = req.cookies.token;
if (!token) return res.status(401).end();
let payload;
try { payload = verifyToken(token); } catch { return res.status(401).end(); }
const user = await prisma.user.findUnique({
where: { id: payload.sub },
select: { id: true, email: true, role: { select: { name: true } } }
});
if (!user) return res.status(404).end();
res.status(200).json({ id: user.id, email: user.email, role: user.role.name });
}