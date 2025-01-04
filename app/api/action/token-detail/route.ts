import { NextResponse } from "next/server";
import { ActionGetResponse, createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();

export const GET = async () => {
  try {
    const tokenId = "GcCy73QMvUoakxCecqWx3SGrrwXVRjZ7SbxYr8jz9RN5"; // 动态 Token ID
    const tokenDetailUrl = `https://moonpump.me/token/${tokenId}`; // 替换为实际的页面地址

    // 模拟生成的 Action ID（可以替换为实际的生成逻辑）
    // const actionId = "sample-action-id";
    const actionUrl = `https://study-virid.vercel.app/token/123`;

    // 定义 Action 数据
    const payload: ActionGetResponse = {
      type: "action",
      title: "View Token Details",
      icon: "https://moonpump.me/image/logo.svg", // 替换为实际的图标地址
      description: "Explore and purchase this token.",
      label: "View Details", // 默认按钮标签（如果没有 links.actions）
      links: {
        actions: [
          {
            type: "transaction",
            label: "Buy Token", // 按钮文本
            href: `${tokenDetailUrl}?action=buy`, // 跳转地址
          },
          {
            type: "transaction",
            label: "Sell Token", // 按钮文本
            href: `${tokenDetailUrl}?action=sell`, // 跳转地址
          },
        ],
      },
      // actionUrl, // 添加 Action URL
    } as ActionGetResponse & { actionUrl: string };

    // 返回 JSON 响应
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