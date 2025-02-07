import { createAccount, getAccounts } from '@/lib/actions/account';
import { verifyJWT } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
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
    const { phone, tgId, username, fullname, apiHash, apiId } = body;

    if (!phone || !tgId || !username || !fullname) {
      return NextResponse.json(
        { message: 'params is required' },
        { status: 400 }
      );
    }

    const account = await createAccount({
      phone,
      tgId,
      username,
      fullname,
      apiHash,
      apiId,
      userId: jwtSub?.userId
    });

    return NextResponse.json({
      code: 0,
      message: 'create account success!',
      data: account
    });
  } catch (error) {
    console.log('create account with error', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // 确保字符串默认值
    const offset = parseInt(searchParams.get('offset') || '0', 10); // 确保数字默认值
    const status = searchParams.get('status') || ''; // 确保字符串默认值
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10); // 确保数字默认值

    const { accounts, totalAccounts } = await getAccounts({
      search,
      offset,
      status,
      pageSize,
      userId: jwtSub.userId
    });

    return NextResponse.json({
      code: 0,
      data: {
        accounts,
        totalAccounts
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: error.code === 'ERR_JWT_EXPIRED' ? 401 : 500,
        message:
          error.code === 'ERR_JWT_EXPIRED'
            ? 'Token expired'
            : error.message || 'Internal server error'
      },
      {
        status: error.code === 'ERR_JWT_EXPIRED' ? 401 : 500
      }
    );
  }
}
