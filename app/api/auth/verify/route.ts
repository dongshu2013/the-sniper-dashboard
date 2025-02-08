import { NextRequest } from 'next/server';
import { getJWT } from '@/lib/jwt';
import { redis } from '@/lib/services/redis';
import { namespace } from '@/lib/constants';
import { createAndUpdateUsers } from '@/lib/actions/user';

export async function POST(request: NextRequest) {
  const requestData = await request.json();
  const { email, code } = requestData;

  if (!email || !code) {
    return Response.json({
      code: -1,
      message: 'request format error'
    });
  }

  try {
    // Check code
    const emailCode = await redis.get(`${namespace}:emailCode:${email}`);

    console.log('🌹🌹', emailCode, code);
    if (!emailCode || emailCode !== code) {
      return Response.json({
        code: -1,
        message: 'code incorrect'
      });
    }

    await redis.del(`${namespace}:emailCode:${email}`);
    const isAdmin = false;
    const admin = await createAndUpdateUsers({
      id: email,
      username: email,
      isAdmin
    });

    const token = await getJWT({
      isAdmin,
      userId: admin?.id!,
      userKey: admin?.userId!,
      userKeyType: 'email'
    });

    return Response.json({
      code: 0,
      data: {
        token,
        user: {
          userId: admin?.id || '',
          userKey: admin?.userId || '',
          userKeyType: 'email',
          isAdmin
        }
      }
    });
  } catch (err) {
    return Response.json(
      {
        code: -1,
        message: 'internal error'
      },
      {
        status: 500
      }
    );
  }
}
