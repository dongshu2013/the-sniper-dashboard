import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session: userSession } = body;

    if (!userSession) {
      return NextResponse.json(
        { message: 'Session is required' },
        { status: 400 }
      );
    }

    const apiId = process.env.TELEGRAM_API_ID;
    const apiHash = process.env.TELEGRAM_API_HASH;
    if (!apiId || !apiHash) {
      return NextResponse.json(
        { message: 'Telegram API credentials are missing' },
        { status: 500 }
      );
    }
    const session = new StringSession(userSession);

    const client = new TelegramClient(session, Number(apiId), apiHash, {});
    await client.connect();

    try {
      await client.invoke(new Api.auth.LogOut());
      await client.disconnect();

      return NextResponse.json({
        code: 0,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Telegram logout error:', error);
      return NextResponse.json(
        { message: 'Failed to logout from Telegram' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
