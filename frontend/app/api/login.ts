// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { signToken, setTokenCookie } from '../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.method !== 'POST') return res.status(405).end();
const { email, password } = req.body as { email: string; password: string };
const user = await prisma.user.findUnique({ where: { email } });
if (!user || !(await bcrypt.compare(password, user.pwd_hash))) {
return res.status(401).json({ error: 'Invalid credentials' });
}
const token = signToken({ sub: user.id, role: (await prisma.role.findUnique({where:{id:user.roleId}}))!.name });
setTokenCookie(res, token);
res.status(200).json({ id: user.id, role: user.roleId });
}