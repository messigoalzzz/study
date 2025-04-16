import React from 'react';
import Image from 'next/image';

const defiItems = [
  {
    id: 1,
    name: 'Solayer Stakes SOL(SOL)',
    apr: '14.06%',
    image: '/images/solayer-stakes.png'
  },
  {
    id: 2,
    name: 'Marinads Stakes SOL(SOL)',
    apr: '8.38%',
    image: '/images/marinads-stakes-1.png'
  },
  {
    id: 3,
    name: 'Marinads Stakes SOL(SOL)',
    apr: '8.38%',
    image: '/images/marinads-stakes-2.png'
  },
  {
    id: 4,
    name: 'Marinads Stakes SOL(SOL)',
    apr: '8.38%',
    image: '/images/marinads-stakes-3.png'
  },
  {
    id: 5,
    name: 'JITO Stakes SOL(SOL)',
    apr: '8.38%',
    image: '/images/jito-stakes.png'
  }
];

export default function DefiList() {
  return (
    <div className="bg-[#FAFAFA] rounded-2xl p-4 flex flex-col gap-4">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-[rgba(0,0,0,0.9)]">DeFi</span>
        </div>
        <button className="flex items-center gap-1 text-sm text-[rgba(0,0,0,0.4)]">
          More
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 9L7.5 6L4.5 3" stroke="rgba(0,0,0,0.4)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 列表 */}
      <div className="flex flex-col gap-4">
        {defiItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-base font-medium text-[rgba(0,0,0,0.9)]">{item.name}</span>
            </div>
            <span className="text-base font-medium text-[rgba(0,0,0,0.9)]">{item.apr} APR</span>
          </div>
        ))}
      </div>
    </div>
  );
} 