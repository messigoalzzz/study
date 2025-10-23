'use client';

import { useState } from 'react';

export default function LiveTestPage() {
  const [mode, setMode] = useState<'select' | 'broadcaster' | 'viewer'>('select');
  const [channelName, setChannelName] = useState('');

  console.log('当前模式:', mode);

  if (mode === 'broadcaster') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">
          主播模式 - 频道: {channelName}
          <button 
            onClick={() => setMode('select')}
            className="ml-4 bg-red-600 px-4 py-2 rounded"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'viewer') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">
          观众模式 - 频道: {channelName}
          <button 
            onClick={() => setMode('select')}
            className="ml-4 bg-blue-600 px-4 py-2 rounded"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">测试页面</h1>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">频道名称</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="输入频道名称"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              console.log('点击主播按钮');
              setMode('broadcaster');
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
          >
            主播模式
          </button>
          
          <button
            onClick={() => {
              console.log('点击观众按钮');
              setMode('viewer');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            观众模式
          </button>
        </div>
      </div>
    </div>
  );
}
