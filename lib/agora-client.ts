// 客户端专用的 Agora SDK 导入
import type AgoraRTC from 'agora-rtc-sdk-ng';

let agoraRTC: typeof AgoraRTC | null = null;

export async function getAgoraRTC() {
  if (typeof window === 'undefined') {
    throw new Error('Agora SDK 只能在客户端使用');
  }
  
  if (!agoraRTC) {
    const module = await import('agora-rtc-sdk-ng');
    agoraRTC = module.default;
  }
  
  return agoraRTC;
}
