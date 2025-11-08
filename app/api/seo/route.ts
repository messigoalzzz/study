import { NextResponse } from 'next/server';
import { getSEOContent } from '@/lib/seo';

export async function GET() {
  try {
    const seoContent = await getSEOContent();
    
    // 添加时间戳确保内容总是最新的
    const response = NextResponse.json({
      ...seoContent,
      timestamp: Date.now(),
    });

    // 设置缓存头，但允许快速更新
    // s-maxage=60: CDN 缓存 60 秒
    // stale-while-revalidate=300: 在重新验证时，允许使用过期内容最多 300 秒
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('SEO API 错误:', error);
    return NextResponse.json(
      { error: '获取 SEO 内容失败' },
      { status: 500 }
    );
  }
}

