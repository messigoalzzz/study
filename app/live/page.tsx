'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Broadcaster = dynamic(() => import('../components/live/Broadcaster'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">加载主播组件...</div>
    </div>
  ),
});

const Viewer = dynamic(() => import('../components/live/Viewer'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">加载观众组件...</div>
    </div>
  ),
});

export default function LivePage() {
  const [mode, setMode] = useState<'select' | 'broadcaster' | 'viewer'>('select');
  const [channelName, setChannelName] = useState('');

  console.log('当前模式:', mode, '频道名:', channelName);

  if (mode === 'broadcaster') {
    console.log('渲染主播组件');
    return <Broadcaster channelName={channelName} onLeave={() => setMode('select')} />;
  }

  if (mode === 'viewer') {
    console.log('渲染观众组件');
    return <Viewer channelName={channelName} onLeave={() => setMode('select')} />;
  }

  console.log('渲染选择页面');

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">直播 Demo</h1>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">频道名称</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="输入频道名称"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              console.log('点击主播按钮，频道名:', channelName);
              if (channelName) {
                setMode('broadcaster');
              }
            }}
            disabled={!channelName}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            开始直播（主播）
          </button>
          
          <button
            onClick={() => {
              console.log('点击观众按钮，频道名:', channelName);
              if (channelName) {
                setMode('viewer');
              }
            }}
            disabled={!channelName}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            观看直播（观众）
          </button>
        </div>
      </div>
    </div>
  );
}
