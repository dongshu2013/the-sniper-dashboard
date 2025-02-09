import { NextResponse } from 'next/server';
import { getJWT, verifyJWT } from '@/lib/jwt';
// import { UserPointModel } from "@/models";
// import connectMongo from "../lib/mongoose"

export async function POST(request: Request) {
  const token =
    request.headers.get('Authorization')?.replace('Bearer ', '') || '';
  const jwtSub = await verifyJWT(token);
  const userKey = jwtSub?.userKey;
  const userId = jwtSub?.userId;
  const userKeyType = jwtSub?.userKeyType;
  const isAdmin = jwtSub?.isAdmin || false;

  if (!userKey || !userId || !userKeyType) {
    return NextResponse.json(
      { code: 401, message: 'Auth failed' },
      { status: 401 }
    );
  }

  try {
    const newToken = await getJWT({
      isAdmin,
      userId,
      userKey,
      userKeyType
    });

    return NextResponse.json({
      code: 0,
      data: { token: newToken, userId, userKey, userKeyType }
    });
  } catch (error) {}

  return NextResponse.json(
    { code: 401, message: 'Auth failed' },
    { status: 401 }
  );
}
