import { createPrivateKey, generateKeyPairSync } from 'crypto';
import dayjs from 'dayjs';
import { jwtVerify, SignJWT, createLocalJWKSet } from 'jose';

export type UserKeyType = 'email' | 'tgId';

export interface JWTSub {
  userId: string;
  userKey: string;
  userKeyType: UserKeyType;
}

export const getJWT = async (user: {
  userId: string;
  userKey: string;
  userKeyType: UserKeyType;
}) => {
  const pemKey = process.env.JWT_PRIVATE_KEY || '';
  const key = createPrivateKey(pemKey);

  const jwtSub = {
    userId: user.userId,
    userKey: user.userKey,
    userKeyType: user.userKeyType
  };

  const jwt = await new SignJWT({
    sub: JSON.stringify(jwtSub),
    iat: dayjs().unix()
  })
    .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
    .setExpirationTime('7d')
    .sign(key);

  // console.log({ jwt });
  return jwt;
};

export const verifyJWT = async (jwt: string): Promise<JWTSub | undefined> => {
  try {
    const pemKey = process.env.JWT_PRIVATE_KEY || '';
    const key = createPrivateKey(pemKey);

    const verifyResult = await jwtVerify(jwt, key).catch((err) => {
      console.error('JWT verification failed:', err);
      throw new Error('Invalid JWT');
    });

    const jwtSub = JSON.parse(verifyResult?.payload?.sub || '');
    return jwtSub;
  } catch {}

  return undefined;
};
