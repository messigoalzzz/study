'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { getAgoraAppId, getTemporaryToken } from '@/lib/agora-config';
import { getAgoraRTC } from '@/lib/agora-client';

interface ViewerProps {
  channelName: string;
  onLeave: () => void;
}

export default function Viewer({ channelName, onLeave }: ViewerProps) {
  console.log('[Viewer] 组件渲染, 频道:', channelName);
  
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const videoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  const joinChannel = useCallback(async () => {
    console.log('[Viewer] 开始加入频道');
    try {
      // 动态加载 Agora SDK
      const AgoraRTC = await getAgoraRTC();
      
      // 创建客户端
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      // 设置为观众角色
      await client.setClientRole('audience');

      // 监听远程用户发布
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video' && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }

        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          if (exists) return prev;
          return [...prev, user];
        });
      });

      // 监听远程用户取消发布
      client.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // 监听远程用户离开
      client.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // 获取 Token（如果配置了）
      const token = await getTemporaryToken(channelName);
      console.log('[Viewer] Token:', token ? '已配置' : '未配置（APP ID 模式）');
      
      // 加入频道
      await client.join(
        getAgoraAppId(),
        channelName,
        token, // Token，如果项目启用了 Token 鉴权则必需
        null
      );

      setIsConnected(true);
    } catch (error) {
      console.error('加入频道失败:', error);
      alert('加入频道失败，请检查配置');
    }
  }, [channelName]);

  useEffect(() => {
    joinChannel();
    // 组件卸载时清理
    return () => {
      console.log('[Viewer] 组件卸载，清理资源');
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [joinChannel]);

  const handleLeave = async () => {
    console.log('[Viewer] 手动离开');
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      setIsConnected(false);
      onLeave();
    } catch (error) {
      console.error('离开频道失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-blue-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected && (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                  <span className="text-white font-semibold">观看中</span>
                </span>
              )}
              <span className="text-white">频道: {channelName}</span>
            </div>
            <button
              onClick={handleLeave}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              退出观看
            </button>
          </div>

          <div className="relative bg-black aspect-video">
            <div ref={videoRef} className="w-full h-full"></div>
            {isConnected && remoteUsers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-xl mb-2">等待主播开播...</div>
                  <div className="text-gray-400">当前频道暂无主播</div>
                </div>
              </div>
            )}
          </div>

          {isConnected && (
            <div className="p-4 text-gray-300 text-center">
              在线观众: {remoteUsers.length > 0 ? '主播在线' : '等待中'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
