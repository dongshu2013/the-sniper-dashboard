'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { telegramLogin } from '@/lib/telelgram-login';
import { saveJwt } from '@/components/lib/networkUtils';

const TelegramLoginButton: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const handleLogin = async () => {
    if (!isClient) return;

    const botId = process.env.NEXT_PUBLIC_BOT_ID;

    // 检查 botId 是否定义
    if (!botId) {
      console.error('Bot ID is not defined.');
      return;
    }

    // 直接跳转到 Telegram 登录页面
    const origin = encodeURIComponent(window.location.origin + '/login');
    const redirectUri = encodeURIComponent('http://mizu.local/login');
    const url = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&redirect_uri=${redirectUri}`;
    window.open(url, '_blank');
  };

  // 在组件挂载时，加载 Telegram 登录按钮的脚本
  useEffect(() => {
    if (isClient) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js';
      script.async = true;

      document.body.appendChild(script);

      // 清理脚本
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isClient]);

  const handleTelegramAuth = async (
    data: Record<string, any>
  ): Promise<void> => {
    try {
      if (data) {
        const res: any = await telegramLogin({ authData: data });
        console.log('🚀 ~ handleAuthCallback ~ accessToken:', res);

        if (res?.code === 0) {
          await saveJwt(res?.data?.token);
          router.push('/dashboard/overview');
        } else {
          toast.error('Login failed');
        }
      } else {
        toast.error('Auth failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
    }
  };

  useEffect(() => {
    try {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://oauth.telegram.org') return;
        console.log('Telegram response:', event.data);
        // {"event":"auth_result","result":{"id":7275460694,"first_name":"Ruby","username":"XiangNuans","photo_url":"https://t.me/i/userpic/320/YnOeGLl5e0HFkFhlJb1qNcPWJ_6o21MYavMhLLsw6T6uCwjNlDImTbVjGMElm1Jx.jpg","auth_date":1734947298,"hash":"80b50e006b1130acafd1eadae74e7e7bc68e9b5399dd5d17aaf5c013beda6807"},"origin":"http://mizu.local/login"}
        handleTelegramAuth(JSON.parse(event.data).result);
      };

      window.addEventListener('message', handleMessage, false);

      return () => {
        window.removeEventListener('message', handleMessage, false);
      };
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
    }
  }, []);

  return (
    <button onClick={handleLogin} className="flex items-center gap-2">
      <Image src={'/tg.png'} alt="telegram" width={50} height={50} />
    </button>
  );
};

export default TelegramLoginButton;
