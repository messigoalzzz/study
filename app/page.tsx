'use client';
import { SessionProvider } from 'next-auth/react';
import Login from '@/app/components/Login';
import ResizableTable from '@/app/components/ResizableTable';

// 定义数据类型
interface StockData {
  symbol: string;
  last: string;
  chg: string;
  chgPercent: string;
}

function Home() {
  // 表格列配置
  const columns = [
    { id: 'symbol', label: 'Symbol' },
    { id: 'last', label: 'Last' },
    {
      id: 'chg',
      label: 'Chg',
      render: (value: string) => (
        <span className={value.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
          {value}
        </span>
      )
    },
    {
      id: 'chgPercent',
      label: 'Chg%',
      render: (value: string) => (
        <span className={value.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
          {value}
        </span>
      )
    },
  ];

  // 表格数据
  const data: StockData[] = [
    { symbol: 'AAPL', last: '173.50', chg: '+2.30', chgPercent: '+1.34%' },
    { symbol: 'GOOGL', last: '2,865.86', chg: '-15.24', chgPercent: '-0.53%' },
    { symbol: 'MSFT', last: '378.85', chg: '+4.65', chgPercent: '+1.24%' },
    { symbol: 'AMZN', last: '178.35', chg: '-1.25', chgPercent: '-0.70%' },
    { symbol: 'TSLA', last: '164.90', chg: '+3.45', chgPercent: '+2.13%' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-center items-center bg-red-600 p-4">
        <span>test333</span>
        <Login/>
      </div>
      <ResizableTable<StockData>
        columns={columns}
        data={data}
        defaultColumnWidth={200}
        minColumnWidth={100}
      />
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