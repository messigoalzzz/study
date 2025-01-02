import { NextResponse } from "next/server";
import { ActionGetResponse, createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();

// GET 路由：生成卡片内容
export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    console.log("Request URL:", requestUrl);

    const tokenId = "GcCy73QMvUoakxCecqWx3SGrrwXVRjZ7SbxYr8jz9RN5"; // 动态 Token ID（实际可以从数据库或参数中获取）
    const tokenDetailUrl = `https://moonpump.me/token/${tokenId}`; // Token 详情页面 URL

    // 生成模拟的 Action 数据
    const payload: ActionGetResponse = {
      type: "action",
      title: "View Token Details",
      icon: "https://moonpump.me/image/logo.svg", // 替换为实际的图标地址
      description: "Explore and purchase this token.",
      label: "View Details", // 按钮默认标签（如果没有 link.actions）
      links: {
        actions: [
          {
            type: "transaction",
            label: "Buy Token", // 按钮文本
            href: `${tokenDetailUrl}?action=buy`, // 点击跳转到 Token 详情页面（购买逻辑）
          },
          {
            type: "transaction",
            label: "Sell Token", // 按钮文本
            href: `${tokenDetailUrl}?action=sell`, // 点击跳转到 Token 详情页面（出售逻辑）
          },
        ],
      },
    };

    return NextResponse.json(payload, { headers });
  } catch (error) {
    console.error("Failed to create GET response:", error);
    return NextResponse.json(
      { error: "Failed to create action." },
      { status: 500, headers }
    );
  }
};

// OPTIONS 路由：确保跨域支持
export const OPTIONS = async () => {
  return new Response(null, { headers });
};