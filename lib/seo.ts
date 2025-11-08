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
      title: 'Tron 钱包生成器',
      description: '安全、快速的 Tron 钱包生成工具，一键生成 Tron 钱包地址、私钥和公钥',
      keywords: 'Tron,钱包,生成器,TRX,区块链',
      ogTitle: 'Tron 钱包生成器',
      ogDescription: '安全、快速的 Tron 钱包生成工具',
      ogImage: '/images/tron-wallet.png',
      ogUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Tron 钱包生成器',
      twitterDescription: '安全、快速的 Tron 钱包生成工具',
      twitterImage: '/images/tron-wallet.png',
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString(),
    };

    return defaultSEO;
  } catch (error) {
    console.error('获取 SEO 内容失败:', error);
    // 返回默认值，确保即使 API 失败也能正常工作
    return {
      title: 'Tron 钱包生成器',
      description: '安全、快速的 Tron 钱包生成工具',
      buildId: Date.now().toString(),
    };
  }
}

