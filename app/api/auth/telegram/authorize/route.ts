import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  
  // Telegram Bot Token 和用户名需要从环境变量获取
  const botToken = '7964430590:AAGyzw82rGZdm458AUC7u1yfb73Y9beBjNo';
  const botUsername = 'KarenAdcBot';
  
  if (!botToken) {
    return NextResponse.json({ error: 'Telegram Bot Token not configured' }, { status: 500 });
  }
  
  if (!botUsername) {
    return NextResponse.json({ error: 'Telegram Bot Username not configured' }, { status: 500 });
  }

  // 构建 Telegram Login Widget HTML
  const telegramAuthHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telegram 授权</title>
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
          .telegram-login {
            margin: 1rem 0;
          }
          .cancel-btn {
            background: #f0f0f0;
            color: #666;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 0.9rem;
          }
          .cancel-btn:hover {
            background: #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">Telegram 账户授权</h2>
          <p class="description">点击下方按钮使用您的 Telegram 账户登录</p>
          
          <div class="telegram-login">
            <script async src="https://telegram.org/js/telegram-widget.js?22" 
              data-telegram-login="${botUsername}"
              data-size="large"
              data-auth-url="${request.nextUrl.origin}/api/auth/telegram/callback"
              data-request-access="write">
            </script>
          </div>
          
          <button class="cancel-btn" onclick="window.location.href='${callbackUrl}'">
            取消授权
          </button>
        </div>
        
        <script>
          // 存储回调URL用于后续重定向
          sessionStorage.setItem('telegram_callback_url', '${callbackUrl}');
        </script>
      </body>
    </html>
  `;

  return new NextResponse(telegramAuthHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
} 