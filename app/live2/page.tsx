'use client';

import { useState } from 'react';
import Broadcaster from '../components/live/Broadcaster';
import Viewer from '../components/live/Viewer';

export default function LivePage() {
  const [mode, setMode] = useState<'select' | 'broadcaster' | 'viewer'>('select');
  const [channelName, setChannelName] = useState('');

  console.log('[Live2] 当前模式:', mode, '频道:', channelName);

  if (mode === 'broadcaster') {
    console.log('[Live2] 渲染主播组件');
    return <Broadcaster channelName={channelName} onLeave={() => setMode('select')} />;
  }

  if (mode === 'viewer') {
    console.log('[Live2] 渲染观众组件');
    return <Viewer channelName={channelName} onLeave={() => setMode('select')} />;
  }

  console.log('[Live2] 渲染选择页面');

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
              console.log('[Live2] 点击主播按钮, 频道名:', channelName);
              if (channelName) {
                console.log('[Live2] 设置模式为 broadcaster');
                setMode('broadcaster');
              } else {
                console.log('[Live2] 频道名为空，不切换');
              }
            }}
            disabled={!channelName}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            开始直播（主播）
          </button>
          
          <button
            onClick={() => {
              console.log('[Live2] 点击观众按钮, 频道名:', channelName);
              if (channelName) {
                console.log('[Live2] 设置模式为 viewer');
                setMode('viewer');
              } else {
                console.log('[Live2] 频道名为空，不切换');
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
