'use server';
import { AuthDataValidator } from '@telegram-auth/server';
import {
  TelegramUserData,
  urlStrToAuthDataMap
} from '@telegram-auth/server/utils';
import { NextRequest } from 'next/server';
import { createAndUpdateUsers } from './actions/user';
import { getJWT } from '@/lib/jwt';

const getSequlizeUrl = (authData: Record<string, string | number>) => {
  const url = 'https://oauth.telegram.org/auth';
  const queryString = Object.keys(authData)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          authData[key as keyof typeof authData]
        )}`
    )
    .join('&');
  return `${url}?${queryString}`;
};

const getUser = async (
  authData: Record<string, string | number>
): Promise<TelegramUserData> => {
  try {
    const validator = new AuthDataValidator({
      botToken: process.env.NEXT_PUBLIC_BOT_ID || '',
      inValidateDataAfter: 3600 * 24 * 7
    });
    const serializedUrl = getSequlizeUrl(authData);
    const data = urlStrToAuthDataMap(serializedUrl);
    return await validator.validate(data);
  } catch (err) {
    console.log('🌹 ~ getUser ~ err:', err);
    throw new Error('telegram validate failed');
  }
};

export async function telegramLogin({ authData }: any) {
  if (!authData) {
    return {
      code: -1,
      message: 'request data invalid'
    };
  }

  try {
    const telegramUser = await getUser(authData);
    console.log('......🚀 ～ ', telegramUser);
    const saveUser = await createAndUpdateUsers(telegramUser);
    const token = await getJWT({
      userId: saveUser._id,
      userKey: saveUser.userId,
      userKeyType: saveUser
    });
    return {
      code: 0,
      data: {
        token,
        userId: saveUser._id,
        userKey: telegramUser.id.toString(),
        userKeyType: 'tgId'
      }
    };
  } catch (err) {
    console.log('error', err);
  }
}
