import { NextRequest } from 'next/server';
import { getJWT } from '@/lib/jwt';

/**
 * @description: google OAuth2.0 login
 * @param request: { tokenId: string }
 * @returns { code: number, data: {token: string} }
 */
export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { userId, email } = requestBody;

  console.log('.userId..', userId, email);

  if (!userId || !email) {
    return Response.json({
      code: -1,
      message: 'params error'
    });
  }

  try {
    const token = await getJWT({
      userId,
      userKey: email,
      userKeyType: 'email',
      isAdmin: false
    });

    return Response.json({
      code: 0,
      data: {
        token
      }
    });
  } catch (err) {
    console.log('Google login failed', err);
    return Response.json({
      code: -1,
      message: 'Google login failed'
    });
  }
}
