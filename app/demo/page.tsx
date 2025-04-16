'use client';

import React from 'react';
import DefiList from '../components/DefiList';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <DefiList />
      </div>
    </div>
  );
}