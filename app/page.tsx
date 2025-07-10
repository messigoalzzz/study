'use client';
import { SessionProvider } from 'next-auth/react';
import Login from '@/app/components/Login';

// 定义数据类型



export default function Page() {
  return (
    <div>
      <SessionProvider>
        <Login />
        <div onClick={()=>{
          const finalCallbackUrl = window.location.href;
          const telegramAuthUrl = `/api/auth/telegram/authorize?callbackUrl=${encodeURIComponent(finalCallbackUrl)}`;
          console.log(`📱 使用自定义流程处理 Telegram 授权:`, telegramAuthUrl);
          window.location.href = telegramAuthUrl;
        }} className='size-10 bg-red-500 cursor-pointer'>
          tg login
        </div>
      </SessionProvider>
    </div>
  );
}