import { httpMessage, namespace } from '@/lib/constants';
import { redis } from '@/lib/services/redis';
import { random } from 'lodash';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const requestData = await request.json();
  const { email } = requestData;
  console.log('email', email);

  if (!email) {
    return Response.json(
      {
        code: 400,
        message: httpMessage[400]
      },
      { status: 400 }
    );
  }

  const cacheCode = await redis.get(`${namespace}:check:emailCode:${email}`);

  if (cacheCode) {
    return Response.json({
      code: -1,
      message: 'Send code too frequently, please try again later'
    });
  }

  let randomCode = '';
  while (randomCode.length < 6) {
    randomCode += random(1, 9);
  }

  console.log('🌈🌈randomCode', randomCode);

  try {
    const res = await fetch('https://api.postmarkapp.com/email/withTemplate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': 'd136fa7d-9598-42cf-925b-1ec502091b9f'
      },
      body: JSON.stringify({
        From: 'info@mizu.global',
        To: email,
        TemplateId: 38054506,
        TemplateModel: {
          code: randomCode
        }
      })
    });

    const resJson = await res.json();

    if (resJson?.ErrorCode === 0) {
      redis.set(`${namespace}:check:emailCode:${email}`, randomCode, 'EX', 60);
      redis.set(`${namespace}:emailCode:${email}`, randomCode, 'EX', 180);
    }
    return Response.json({
      code: 0,
      data: {}
    });
  } catch (err) {
    return Response.json(
      {
        code: 500,
        message: httpMessage[500]
      },
      { status: 500 }
    );
  }
}
