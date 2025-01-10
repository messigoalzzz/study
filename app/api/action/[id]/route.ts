import { NextResponse } from "next/server";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
const headers = createActionHeaders();
export const GET = async (
) => {
  // const { id } = await props.params;

  // const requestUrl = new URL(req.url);
  // const { toPubkey } = validatedQueryParams(requestUrl) as {
  //   toPubkey: PublicKey;
  //   amount: number;
  // };

  // const baseHref = new URL(
  //   `/api/action/${id}?to=${toPubkey.toBase58()}`,
  //   requestUrl.origin
  // ).toString();

  // 生成动态的响应数据
  const payload: ActionGetResponse = {
    title: "AAAAAA-----",
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

  const response = NextResponse.json(payload, { status: 200 ,headers});
  // response.headers.set("Access-Control-Allow-Origin", "*");
  // response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  // response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
};

// OPTIONS 路由：确保跨域支持
export const OPTIONS = async () => {
  const response = new NextResponse(null, { status: 200,headers });
  return response;
};

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl) as {
      toPubkey: PublicKey;
      amount: number;
    };

    console.log("----requestUrl--11", requestUrl);
    console.log("----amount--22", amount);
    console.log("----toPubkey--33", toPubkey);

    const body: ActionPostRequest = await req.json();

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log("---err", err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    console.log("----account--44", account);

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("mainnet-beta")
    );

    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0 // note: simple accounts that just store native SOL have `0` bytes of data
    );
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }

    // create an instruction to transfer native SOL from one wallet to another
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // get the latest blockhash amd block height
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // create a legacy transaction
    const transaction = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(transferSolInstruction);

    // versioned transactions are also supported
    // const transaction = new VersionedTransaction(
    //   new TransactionMessage({
    //     payerKey: account,
    //     recentBlockhash: blockhash,
    //     instructions: [transferSolInstruction],
    //   }).compileToV0Message(),
    //   // note: you can also use `compileToLegacyMessage`
    // );

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Sent ${amount} SOL to Alice: ${toPubkey.toBase58()}`,
      },
      // note: no additional signers are needed
      // signers: [],
    });

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    const message = "Something went wrong demo";
    return new Response(
      JSON.stringify({ message }), // 包装成 JSON 格式
      {
        status: 400,
        headers,
      }
    );
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = new PublicKey(
    "FWXHZxDocgchBjADAxSuyPCVhh6fNLT7DUggabAsuz1y"
  );
  let amount: number = 0.1;

  if (requestUrl.searchParams.get("to")) {
    toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

    if (amount <= 0)
      return new Response("不合法笨蛋", {
        status: 400,
        headers,
      });
  } catch (err) {
    console.log("---err", err);
    //  NextResponse.json(
    //   { error: "Invalid input query parameter", message: '哈哈哈哈' },
    //   { status: 400, headers: { "Content-Type": "application/json" } }
    // );

    return new Response("不合法笨蛋", {
      status: 400,
      headers,
    });
  }

  return {
    amount,
    toPubkey,
  };
}
