import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 获取 Telegram 返回的用户数据
  const id = searchParams.get('id');
  const first_name = searchParams.get('first_name');
  const last_name = searchParams.get('last_name');
  const username = searchParams.get('username');
  const photo_url = searchParams.get('photo_url');
  const auth_date = searchParams.get('auth_date');
  const hash = searchParams.get('hash');

  if (!id || !hash || !auth_date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // 验证 Telegram 数据的真实性
  const botToken = '7964430590:AAGyzw82rGZdm458AUC7u1yfb73Y9beBjNo';
  if (!botToken) {
    return NextResponse.json({ error: 'Telegram Bot Token not configured' }, { status: 500 });
  }

  // 构建验证数据
  const dataCheck: string[] = [];
  if (auth_date) dataCheck.push(`auth_date=${auth_date}`);
  if (first_name) dataCheck.push(`first_name=${first_name}`);
  if (id) dataCheck.push(`id=${id}`);
  if (last_name) dataCheck.push(`last_name=${last_name}`);
  if (photo_url) dataCheck.push(`photo_url=${photo_url}`);
  if (username) dataCheck.push(`username=${username}`);

  const dataCheckString = dataCheck.sort().join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return NextResponse.json({ error: 'Invalid authentication data' }, { status: 401 });
  }

  // 检查数据是否过期（5分钟内有效）
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - parseInt(auth_date) > 300) {
    return NextResponse.json({ error: 'Authentication data expired' }, { status: 401 });
  }



  // 构建重定向页面
  const callbackHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telegram 授权成功</title>
        <meta charset="UTF-8">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            max-width: 400px;
          }
          .success-icon {
            color: #28a745;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .title {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
          }
          .description {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .loading {
            color: #0088cc;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h2 class="title">Telegram 授权成功</h2>
          <p class="description">
            欢迎，${first_name}${last_name ? ' ' + last_name : ''}！<br>
            ${username ? '@' + username : ''}
          </p>
          <p class="loading">正在处理授权信息，请稍候...</p>
        </div>
        
        <script>
          // 调用后端接口保存授权信息
          fetch('/api/user/edit-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegram: '${id}' // 字段名为telegram，值为用户ID
            }),
            credentials: 'include'
          })
          .then(response => response.json())
          .then(data => {
            // 获取回调URL并重定向
            const callbackUrl = sessionStorage.getItem('telegram_callback_url') || '/account';
            sessionStorage.removeItem('telegram_callback_url');
            window.location.href = callbackUrl;
          })
          .catch(error => {
            // 即使保存失败也要重定向回去
            const callbackUrl = sessionStorage.getItem('telegram_callback_url') || '/account';
            sessionStorage.removeItem('telegram_callback_url');
            window.location.href = callbackUrl;
          });
        </script>
      </body>
    </html>
  `;

  return new NextResponse(callbackHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
} 