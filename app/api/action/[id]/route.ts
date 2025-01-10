import { createActionHeaders } from "@solana/actions";
import { NextResponse } from "next/server";
const headers = createActionHeaders();
export const GET = async () => {
  // 生成动态的响应数据
  const payload = {
    title: "ThreeCupsOneBall",
    icon: "https://www.threecupsoneball.fun/start.jpg",
    description:
      "Done be afraid now, take a pick!Guess correctly and win a prize",
    label: "Play!",
    links: {
      actions: [
        {
          type: "post",
          label: "Left",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path1=path1/correct_action",
        },
        {
          type: "post",
          label: "Middle",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path2=path1/wrong_action",
        },
        {
          type: "post",
          label: "Right",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path3=path1/wrong_action",
        },
      ],
    },
  };

  // 创建响应对象，并添加 CORS 头
  const response = NextResponse.json(payload, { headers});
  // response.headers.set("Access-Control-Allow-Origin", "*");
  // response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  // response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
};

// 确保 OPTIONS 方法支持 CORS 预检请求
export const OPTIONS = async () => {
  const response = new NextResponse(null, { headers });
  // response.headers.set("Access-Control-Allow-Origin", "*");
  // response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  // response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
};