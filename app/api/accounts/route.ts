import { createAccount } from "@/lib/actions/account";
import { verifyJWT } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const jwtSub = await verifyJWT(token);

    if (!jwtSub) {
      return NextResponse.json(
        {
          code: 401,
          message: "Authorization header missing",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, tgId, username, fullname, apiHash, apiId } = body;

    if (!phone || !tgId || username || !fullname) {
      return NextResponse.json(
        { error: 'params is required' },
        { status: 400 }
      );
    }

    const account = await createAccount({
      phone, tgId, username, fullname, apiHash, apiId, userId: jwtSub?.userId
    })

    return NextResponse.json({ code: 0, message: "create account success!", data: account });
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
