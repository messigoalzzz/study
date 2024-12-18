
'use client';
import { SessionProvider } from 'next-auth/react';

import Login from '@/app/components/Login'
 function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-red-600">
      <span>test333</span>

      <Login/>
    </div>
  );
}


export default function Page() {
  return (
    <div>
      <SessionProvider>
      <Home/>

      </SessionProvider>
    </div>
  );
}