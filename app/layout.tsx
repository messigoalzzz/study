import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSEOContent } from "@/lib/seo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// 动态生成 metadata
export async function generateMetadata(): Promise<Metadata> {
  const seoContent = await getSEOContent();
  
  // 获取基础 URL，优先使用环境变量
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.NEXTAUTH_URL || 
                   seoContent.ogUrl || 
                   'https://your-domain.com';
  
  // 添加版本参数到 URL，确保平台能抓取到最新内容
  // 使用 buildId 或时间戳作为版本参数
  const versionParam = seoContent.buildId || Date.now().toString();
  const ogUrl = `${baseUrl}?v=${versionParam}`;

  return {
    title: seoContent.title || 'Tron 钱包生成器',
    description: seoContent.description || '安全、快速的 Tron 钱包生成工具',
    keywords: seoContent.keywords,
    openGraph: {
      title: seoContent.ogTitle || seoContent.title,
      description: seoContent.ogDescription || seoContent.description,
      url: ogUrl, // 使用带版本参数的 URL
      images: seoContent.ogImage ? [
        {
          url: seoContent.ogImage.startsWith('http') 
            ? seoContent.ogImage 
            : `${baseUrl}${seoContent.ogImage}`,
          width: 1200,
          height: 630,
          alt: seoContent.ogTitle || seoContent.title,
        }
      ] : [],
      type: 'website',
      siteName: seoContent.title || 'Tron 钱包生成器',
    },
    twitter: {
      card: seoContent.twitterCard || 'summary_large_image',
      title: seoContent.twitterTitle || seoContent.ogTitle || seoContent.title,
      description: seoContent.twitterDescription || seoContent.ogDescription || seoContent.description,
      images: seoContent.twitterImage || seoContent.ogImage 
        ? [
            (seoContent.twitterImage || seoContent.ogImage)?.startsWith('http')
              ? (seoContent.twitterImage || seoContent.ogImage)
              : `${baseUrl}${seoContent.twitterImage || seoContent.ogImage}`
          ]
        : [],
    },
    // 添加其他 meta 标签
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: ogUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         {children}
      </body>
    </html>
  );
}
