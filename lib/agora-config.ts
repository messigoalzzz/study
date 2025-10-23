// Agora 配置 - 客户端安全
export const getAgoraAppId = () => {
  return process.env.NEXT_PUBLIC_AGORA_APP_ID || '2552a17beb2d4323854a435237274e1a';
};

// 获取 Token（如果配置了）
export const getAgoraToken = () => {
  return process.env.NEXT_PUBLIC_AGORA_TOKEN || null;
};

// 获取 Token 服务器 URL（如果有）
export const getTokenServerUrl = () => {
  return process.env.NEXT_PUBLIC_TOKEN_SERVER_URL || null;
};

// 验证配置
export function validateAgoraConfig() {
  const appId = getAgoraAppId();
  if (!appId) {
    console.warn('请在 .env.local 中配置 NEXT_PUBLIC_AGORA_APP_ID');
    return false;
  }
  return true;
}

// 获取临时 Token（用于测试）
export async function getTemporaryToken(channelName: string, uid: number = 0): Promise<string | null> {
  const tokenServerUrl = getTokenServerUrl();
  
  if (!tokenServerUrl) {
    // 如果没有配置 Token 服务器，返回静态 Token 或 null
    return getAgoraToken();
  }
  
  try {
    const response = await fetch(`${tokenServerUrl}/rtc/${channelName}/publisher/uid/${uid}`);
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('获取 Token 失败:', error);
    return null;
  }
}
