
'use client';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import ClientWalletProvider from '../providers/WalletProvider';

const AirdropTasks = dynamic(
  () => import('@/app/components/AirdropTasks'),
  { ssr: false }
);

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <AirdropTasks />
    </div>
  );
}


export default function Page() {
  return (
    <div>
      <SessionProvider>
        <ClientWalletProvider>
          <Home/>
        </ClientWalletProvider>
      </SessionProvider>
    </div>
  );
}