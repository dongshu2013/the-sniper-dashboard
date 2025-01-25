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
        const status = JSON.parse(jsonStatus || '{}');
        if (status.account_id) {
          return NextResponse.json(
            {
              code: 1,
              message: 'Code already sent'
            },
            { status: 400 }
          );
        }
        await redisService.pushAccountRequest(body);
        return NextResponse.json({ success: true });

      case 'confirm-code':
        const { phone, code } = body;
        await redisService.setPhoneCode(phone, code);
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
          { error: 'Phone number is required' },
          { status: 400 }
        );
      }
      const jsonStatus = await redisService.getPhoneStatus(phone);
      console.log('🚀🚀🚀jsonStatus', jsonStatus);
      if (!jsonStatus) {
        return NextResponse.json({ status: 'pending' });
      }
      const { status, account_id } = JSON.parse(jsonStatus);

      console.log('🚀🚀🚀', status, account_id);
      if (status === 'success') {
        await saveUserAccounts({
          userId: jwtSub.userId,
          accountId: account_id
        });
      }

      return NextResponse.json({ status: status || 'pending' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('🚀🚀🚀', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
