import { NextResponse } from 'next/server';
import { redisService } from '@/lib/services/redis';
import { verifyJWT } from '@/lib/jwt';
import { saveUserAccounts } from '@/lib/actions/account';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const token =
      request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const jwtSub = await verifyJWT(token);
    if (!jwtSub) {
      return NextResponse.json(
        {
          code: 401,
          message: 'Authorization header missing'
        },
        { status: 401 }
      );
    }
    const body = await request.json();

    switch (action) {
      case 'request-code':
        console.log('🚀🚀🚀body', body);
        // TODO: check if user has already requested code
        const jsonStatus = await redisService.getPhoneStatus(body.phone);
        console.log('🌽🌽🌽 jsonStatus', jsonStatus);
        const status = JSON.parse(jsonStatus || '{}');
        if (status && status.status === 'error') {
          return NextResponse.json(
            {
              code: 1,
              message: 'check after user input the phone and try to get code'
            },
            { status: 400 }
          );
        }
        if (status && status.status === 'success') {
          return NextResponse.json(
            {
              code: 1,
              message: 'The account is already imported'
            },
            { status: 400 }
          );
        }
        await redisService.pushAccountRequest(body);
        return NextResponse.json({ success: true });

      case 'confirm-code':
        const { phone, code, password } = body;
        await redisService.setPhoneCode(phone, code);
        if (password) {
          await redisService.setPassword(phone, password);
        }
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const { searchParams } = new URL(request.url);
    const token =
      request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const jwtSub = await verifyJWT(token);
    if (!jwtSub) {
      return NextResponse.json(
        {
          code: 401,
          message: 'Authorization header missing'
        },
        { status: 401 }
      );
    }

    if (action === 'status') {
      const phone = searchParams.get('phone');
      if (!phone) {
        return NextResponse.json(
          { message: 'Phone number is required' },
          { status: 400 }
        );
      }
      const jsonStatus = await redisService.getPhoneStatus(phone);

      const { status, account_id } = JSON.parse(jsonStatus || '{}');
      if (status === 'success') {
        await saveUserAccounts({
          userId: jwtSub.userId,
          accountId: account_id
        });
      }

      return NextResponse.json({ status: '2fa' });
    }
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('🚀🚀🚀', error);
    return NextResponse.json({ message: 'get status failed', status: 500 });
  }
}
