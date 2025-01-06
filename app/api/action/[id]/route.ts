import { NextResponse } from "next/server";
import { ActionGetResponse, createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();
export const GET = async (req: Request, props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  console.log('--req',req);
  console.log('-props',props);
  
  

  // 生成动态的响应数据
  const payload: ActionGetResponse = {
    type: "action",
    title: `Buy Token ${id}`,
    description: `Purchase token ${id}.`,
    icon: "https://moonpump.me/image/logo.svg",
    label: "Buy Token",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Buy Token",
          href: `solana:<BASE58_TRANSACTION_DATA_${id}>`, // 替换为动态生成的交易链接
        },
      ],
    },
  };

  return NextResponse.json(payload,{ headers });
};

// OPTIONS 路由：确保跨域支持
export const OPTIONS = async () => {
    return new Response(null, { headers });
  };