'use client';

import { useState } from 'react';
import { getAgoraAppId } from '@/lib/agora-config';

export default function AgoraTestPage() {
  const [appId, setAppId] = useState('');
  const [testResult, setTestResult] = useState<string>('');

  const checkConfig = () => {
    const currentAppId = getAgoraAppId();
    setAppId(currentAppId);
    
    let result = '配置检查结果：\n\n';
    
    if (!currentAppId) {
      result += '❌ App ID 未配置\n';
      result += '请在 .env.local 中设置 NEXT_PUBLIC_AGORA_APP_ID';
    } else if (currentAppId === 'your_app_id_here') {
      result += '❌ App ID 是占位符\n';
      result += '请替换为真实的 App ID';
    } else if (currentAppId.length !== 32) {
      result += '⚠️ App ID 长度不正确\n';
      result += `当前长度：${currentAppId.length}，应该是 32 位\n`;
      result += '请检查是否复制完整';
    } else {
      result += '✅ App ID 格式看起来正确\n';
      result += `App ID: ${currentAppId}\n\n`;
      result += '如果仍然无法连接，请检查：\n';
      result += '1. Agora 控制台中项目状态是否正常\n';
      result += '2. 项目鉴权方式是否设置为 "APP ID"\n';
      result += '3. 是否有网络限制（防火墙等）';
    }
    
    setTestResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Agora 配置检查</h1>
          
          <div className="space-y-4">
            <button
              onClick={checkConfig}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              检查配置
            </button>
            
            {testResult && (
              <div className="bg-gray-700 rounded-lg p-4">
                <pre className="text-white whitespace-pre-wrap font-mono text-sm">
                  {testResult}
                </pre>
              </div>
            )}
            
            <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
              <h2 className="text-xl font-semibold text-white mb-4">配置步骤</h2>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  访问 <a href="https://console.agora.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Agora 控制台</a>
                </li>
                <li>注册/登录账号</li>
                <li>创建新项目或选择现有项目</li>
                <li>
                  <strong className="text-white">重要：</strong>确保项目的鉴权机制设置为 <strong className="text-yellow-400">"APP ID"</strong>（测试模式）
                  <div className="ml-6 mt-2 text-sm text-gray-400">
                    如果设置为 "Token"，需要额外的服务器来生成 Token
                  </div>
                </li>
                <li>复制项目的 App ID（32位十六进制字符串）</li>
                <li>
                  在项目根目录的 <code className="bg-gray-600 px-2 py-1 rounded">.env.local</code> 文件中配置：
                  <pre className="bg-gray-600 p-3 rounded mt-2 text-sm overflow-x-auto">
                    NEXT_PUBLIC_AGORA_APP_ID=你的App_ID
                  </pre>
                </li>
                <li>
                  重启开发服务器：
                  <pre className="bg-gray-600 p-3 rounded mt-2 text-sm">
                    yarn dev
                  </pre>
                </li>
              </ol>
            </div>
            
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ 常见问题</h3>
              <ul className="text-yellow-200 text-sm space-y-2 list-disc list-inside">
                <li>错误 "dynamic use static key"：项目启用了 Token 鉴权，需要改为 APP ID 模式</li>
                <li>错误 "invalid vendor key"：App ID 不正确或未配置</li>
                <li>修改 .env.local 后必须重启开发服务器才能生效</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
