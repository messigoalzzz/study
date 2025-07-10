'use client';
import { SessionProvider } from 'next-auth/react';
import Login from '@/app/components/Login';

// 定义数据类型



export default function Page() {
  return (
    <div>
      <SessionProvider>
        <Login />
      </SessionProvider>
    </div>
  );
}