import { NextResponse } from 'next/server';
import { redisService } from '@/lib/services/redis';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const body = await request.json();

    switch (action) {
      case 'request-code':
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

    if (action === 'status') {
      const phone = searchParams.get('phone');
      if (!phone) {
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        );
      }

      const status = await redisService.getPhoneStatus(phone);
      return NextResponse.json({ status: status || 'pending' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
