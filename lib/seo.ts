// lib/seo.ts

// SEO 内容接口类型定义
export interface SEOContent {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  buildId?: string;
}

// 获取 SEO 内容的函数（可在服务器端和客户端使用）
export async function getSEOContent(): Promise<SEOContent> {
  try {
    // 从你的后端 API 获取 SEO 内容
    // 如果后端有专门的 SEO 接口，取消下面的注释并使用它
    // const response = await http.get<SEOContent>('/api/seo/content');
    // return {
    //   ...response.data,
    //   buildId: process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString(),
    // };

    // 如果没有专门的 SEO 接口，可以从其他接口获取或使用默认值
    // 这里提供一个示例，你可以根据实际情况修改
    const defaultSEO: SEOContent = {
      title: '工资流水模拟器',
      description: '按工资、时间范围和发薪日生成工资流水数组，支持周末自动顺延到周一',
      keywords: '工资流水,模拟器,USDT,TRX,交易数据',
      ogTitle: '工资流水模拟器',
      ogDescription: '快速生成工资流水数组，便于测试和演示',
      ogImage: '/images/tron-wallet.png',
      ogUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
      twitterCard: 'summary_large_image',
      twitterTitle: '工资流水模拟器',
      twitterDescription: '快速生成工资流水数组，便于测试和演示',
      twitterImage: '/images/tron-wallet.png',
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString(),
    };

    return defaultSEO;
  } catch (error) {
    console.error('获取 SEO 内容失败:', error);
    // 返回默认值，确保即使 API 失败也能正常工作
    return {
      title: '工资流水模拟器',
      description: '按工资、时间范围和发薪日生成工资流水数组',
      buildId: Date.now().toString(),
    };
  }
}
