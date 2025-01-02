import {
    ActionGetResponse,
    createActionHeaders,
    ActionPostResponse,
    createPostResponse,
  } from "@solana/actions";
  import {
    Connection,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
  } from "@solana/web3.js";
  import { NextResponse } from "next/server";
  
  // 创建请求头
  const headers = createActionHeaders();
  
  // GET 路由：生成卡片内容
  export const GET = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      console.log('requestUrl',requestUrl);
      
      const tokenId = "123"; // 动态 Token ID
      const tokenDetailUrl = `https://yourdomain.com/token/${tokenId}`;
  
      // 创建一个模拟的 Action ID（在生产环境应从实际的生成逻辑获取）
      const actionId = "your-generated-action-id"; 
      const actionUrl = `https://dialect.to/actions/${actionId}`;
  
      // 定义卡片的 Action 数据
      const payload: ActionGetResponse = {
        type: "action",
        title: "View Token Details",
        icon: "https://moonpump.me/image/logo.svg", // 替换为你的图标地址
        description: "Explore and purchase this token.",
        label: "View Details", // 按钮默认标签（如果没有 link.actions）
        links: {
          actions: [
            {
              type: "transaction",
              label: "Buy Token", // 按钮文本
              href: `${tokenDetailUrl}?buy=true`, // 点击后跳转链接
            },
            {
              type: "transaction",
              label: "Sell Token", // 按钮文本
              href: `${tokenDetailUrl}?sell=true`,
            },
          ],
        },
      };
  
      // 在返回的 JSON 数据中添加 actionUrl
      return NextResponse.json({ ...payload, actionUrl }, { headers });
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
  
  // POST 路由：处理链上交易
  export const POST = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { toPubkey, amount } = validatedQueryParams(requestUrl);
  
      const connection = new Connection(
        process.env.SOLANA_RPC! || clusterApiUrl("mainnet-beta")
      );
  
      const body = await req.json();
      const fromPubkey = new PublicKey(body.account);
  
      // 创建 SOL 转账指令
      const transferSolInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      });
  
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
  
      const transaction = new Transaction({
        feePayer: fromPubkey,
        blockhash,
        lastValidBlockHeight,
      }).add(transferSolInstruction);
  
      // 返回交易给客户端签名
      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          type: "transaction",
          transaction,
          message: `Transferred ${amount} SOL to ${toPubkey.toBase58()}`,
        },
      });
  
      return NextResponse.json(payload, { headers });
    } catch (error) {
      console.error("Failed to process transaction:", error);
      return NextResponse.json(
        { error: "Failed to process transaction." },
        { status: 500, headers }
      );
    }
  };
  
  // 查询参数验证函数
  function validatedQueryParams(requestUrl: URL) {
    let toPubkey: PublicKey = new PublicKey(
      "FWXHZxDocgchBjADAxSuyPCVhh6fNLT7DUggabAsuz1y"
    );
    let amount: number = 0.1;
  
    try {
      if (requestUrl.searchParams.get("to")) {
        toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
      }
    } catch (err) {
      throw new Error("Invalid input query parameter: to");
    }
  
    try {
      if (requestUrl.searchParams.get("amount")) {
        amount = parseFloat(requestUrl.searchParams.get("amount")!);
      }
  
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
    } catch (err) {
      throw new Error("Invalid input query parameter: amount");
    }
  
    return { toPubkey, amount };
  }