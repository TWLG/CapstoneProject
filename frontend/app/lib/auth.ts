// lib/auth.ts
import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_NAME = 'token';
const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

type JWTPayload = { sub: string; role: string };

/** Sign a JWT for a given payload (sub = user ID, role) */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

/** Verify a JWT and return its payload */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

/** Set the token cookie on the response */
export function setTokenCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    `${TOKEN_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${TOKEN_MAX_AGE}`,
    'SameSite=Strict',
    isProd ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookie);
}

/** Clear the token cookie */
export function clearTokenCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `${TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`
  );
}
