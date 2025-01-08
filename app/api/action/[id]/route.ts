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
  req: Request,
  props: { params: Promise<{ id: string }> }
) => {
  const { id } = await props.params;

  const requestUrl = new URL(req.url);
  const { toPubkey } = validatedQueryParams(requestUrl) as {
    toPubkey: PublicKey;
    amount: number;
  };

  const baseHref = new URL(
    `/api/action/${id}?to=${toPubkey.toBase58()}`,
    requestUrl.origin
  ).toString();

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
          label: "0.1 SOL", // button text
          href: `${baseHref}&amount=${"0.1"}`,
        },
        {
          type: "transaction",
          label: "0.5 SOL", // button text
          href: `${baseHref}&amount=${"0.5"}`,
        },
        {
          type: "transaction",
          label: "1 SOL", // button text
          href: `${baseHref}&amount=${"1"}`,
        },
        {
            type: 'transaction',
            label: `Buy Token ${id}`, // button text
            href: `${baseHref}&amount={amount}`, // this href will have a text input
            parameters: [
              {
                name: 'amount', // parameter name in the `href` above
                label: 'Enter a custom SOL amount', // placeholder of the text input
                required: true,
              },
            ],
          },
      ],
    },
  };

  return NextResponse.json(payload, { headers });
};

// OPTIONS 路由：确保跨域支持
export const OPTIONS = async () => {
  return new Response(null, { headers });
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
    let message = "Something went wrong";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
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

    if (amount <= 0)   throw new Error("Invalid input query parameter: amount");;
  } catch (err) {
    console.log("---err", err);
    //  NextResponse.json(
    //   { error: "Invalid input query parameter", message: '哈哈哈哈' },
    //   { status: 400, headers: { "Content-Type": "application/json" } }
    // );

    return new Response('不合法笨蛋', {
      status: 400,
      headers,
    });
  }

  return {
    amount,
    toPubkey,
  };
}
