'use client';

import { useEffect, useRef, useState } from 'react';
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { getAgoraAppId, getTemporaryToken } from '@/lib/agora-config';
import { getAgoraRTC } from '@/lib/agora-client';

interface BroadcasterProps {
  channelName: string;
  onLeave: () => void;
}

export default function Broadcaster({ channelName, onLeave }: BroadcasterProps) {
  console.log('[Broadcaster] 组件渲染, 频道:', channelName);
  
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    // 组件卸载时清理资源
    return () => {
      console.log('[Broadcaster] 组件卸载，清理资源');
      // 停止并关闭轨道
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
      }
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
      }
      // 离开频道
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, []);

  const handleLeave = async () => {
    console.log('[Broadcaster] 手动离开');
    try {
      // 停止并关闭轨道
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
      }
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
      }

      // 离开频道
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      setIsLive(false);
      onLeave();
    } catch (error) {
      console.error('离开频道失败:', error);
    }
  };

  const handleStartLive = async () => {
    try {
      const appId = getAgoraAppId();
      console.log('[Broadcaster] 使用的 App ID:', appId);
      
      if (!appId || appId === 'your_app_id_here') {
        alert('请先配置有效的 Agora App ID！\n\n1. 访问 https://console.agora.io/\n2. 创建项目并获取 App ID\n3. 在 .env.local 中配置 NEXT_PUBLIC_AGORA_APP_ID\n4. 重启开发服务器');
        return;
      }
      
      // 动态加载 Agora SDK
      const AgoraRTC = await getAgoraRTC();
      
      // 创建客户端
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      // 设置为主播角色
      await client.setClientRole('host');

      // 获取 Token（如果配置了）
      const token = await getTemporaryToken(channelName);
      console.log('[Broadcaster] Token:', token ? '已配置' : '未配置（APP ID 模式）');
      
      // 加入频道
      console.log('[Broadcaster] 加入频道:', channelName);
      await client.join(
        appId,
        channelName,
        token, // Token，如果项目启用了 Token 鉴权则必需
        null
      );

      // 创建音视频轨道
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      audioTrackRef.current = audioTrack;
      videoTrackRef.current = videoTrack;

      // 播放本地视频
      if (videoRef.current) {
        videoTrack.play(videoRef.current);
      }

      // 发布音视频轨道
      await client.publish([audioTrack, videoTrack]);

      setIsLive(true);
    } catch (error: unknown) {
      console.error('开始直播失败:', error);
      
      let errorMsg = '开始直播失败！\n\n';
      if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
        errorMsg += '错误原因：无法连接到 Agora 服务器\n\n';
        errorMsg += '可能的解决方案：\n';
        errorMsg += '1. 检查 App ID 是否正确\n';
        errorMsg += '2. 确保项目鉴权方式设置为 "APP ID" 而不是 "Token"\n';
        errorMsg += '3. 在 Agora 控制台检查项目状态是否正常\n\n';
        errorMsg += '访问：https://console.agora.io/';
      } else if (error.code === 'INVALID_PARAMS') {
        errorMsg += '参数错误，请检查配置';
      } else {
        errorMsg += error.message || '未知错误';
      }
      
      alert(errorMsg);
    }
  };

  const toggleMute = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (videoTrackRef.current) {
      videoTrackRef.current.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-red-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLive && (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  <span className="text-white font-semibold">直播中</span>
                </span>
              )}
              <span className="text-white">频道: {channelName}</span>
            </div>
            <button
              onClick={handleLeave}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              结束直播
            </button>
          </div>

          <div className="relative bg-black aspect-video">
            <div ref={videoRef} className="w-full h-full"></div>
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleStartLive}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-semibold"
                >
                  开始直播
                </button>
              </div>
            )}
          </div>

          {isLive && (
            <div className="p-4 flex gap-3 justify-center">
              <button
                onClick={toggleMute}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isMuted ? '取消静音' : '静音'}
              </button>
              <button
                onClick={toggleVideo}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? '开启摄像头' : '关闭摄像头'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
