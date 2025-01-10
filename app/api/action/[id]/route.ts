import { NextResponse } from "next/server";
import { ActionGetResponse, createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();

export const GET = async (
  req: Request,
  props: { params: Promise<{ id: string }> }
) => {
  const { id } = await props.params;

  const tokenData = {
    tokenDetails: {
      createdAt: 1735888715806,
      updatedAt: 1736475750033,
      id: 976,
      token_name: "AAAAADogePaw",
      contract_address: "Hqqcxfg5ti75U4T3Vtry6Xm83A21qNCzaoHSkYiDVt1Z",
      ticker_symbol: "SSAAAADPAW",
      supply: 1000000000,
      market_cap: 42.5557184869,
      avaliable_buy: 589813646.493254,
      sol_balance: 7.01204,
      token_number: null,
      token_price: 4.26e-8,
      description:
        "DogePaw is a fun and engaging cryptocurrency inspired by the playful nature of dogs. With its unique branding based on a charming dog avatar, DogePaw aims to capture the hearts of pet lovers and meme enthusiasts alike. Join the pack and enjoy the journey with DogePaw, the token that combines the love for dogs with the excitement of crypto.",
      image_url:
        "https://ipfs.io/ipfs/QmVw7bUs2G5Ak1aSWPic7WFikdc1goBqfPvihTkNbfG9M3",
      creator_id: 62,
      in_progress: 25,
      votes: 0,
      vote_down: 0,
      vote_up: 0,
      website: "",
      telegram: "",
      twitter: "t745628192",
      creator_wallet_address: "5yJEP8za1fBH7GjZ6XPrmVFMJihDwskTCw9a6uYf2LnN",
      market_id: "",
      amm_pool_id: "",
      stake_pool_id: "",
      bondingcurve_address: "",
      metadata_uri:
        "https://ipfs.io/ipfs/QmVw7bUs2G5Ak1aSWPic7WFikdc1goBqfPvihTkNbfG9M3",
      on_chain: true,
      show_in_home: true,
      launch_by_ai: true,
      twitter_img_url:
        "https://ipfs.io/ipfs/QmdD62z5GrmNjuSyxQJHooNYhj96fNyLZsgV9Fs28hB3a6",
      category: 1,
      live: {
        status: 0,
        platform: 1,
        live_url: "",
      },
      voteStatus: "abstentions",
      creator: {
        id: 62,
        nickname: "5yJEP8...2LnN",
        profile_photo_url: "https://static.moonpump.me/avatars/9.png",
      },
      status: 0,
    },
  };

  const tokenInfo = tokenData.tokenDetails;

  const baseHref = new URL(
    `/api/actions/${id}?on_chain=${tokenInfo.on_chain}&token_name=${tokenInfo.token_name}&ticker_symbol=${tokenInfo.ticker_symbol}&metadata_uri=${tokenInfo.metadata_uri}&contract_address=${tokenInfo.contract_address}`,
    process.env.NEXTAUTH_URL
  ).toString();

  // 生成动态的响应数据
  const payload: ActionGetResponse = {
    type: "action",
    title: `Buy ${tokenInfo.ticker_symbol}`,
    description: `${tokenInfo.description}`,
    icon: `${tokenInfo.twitter_img_url || tokenInfo.image_url}`,
    label: `Buy ${tokenInfo.token_name}`,
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
          type: "transaction",
          label: `Buy ${tokenInfo.ticker_symbol}`, // button text
          href: `${baseHref}&amount={amount}`, // this href will have a text input
          parameters: [
            {
              name: "amount", // parameter name in the `href` above
              label: "Enter a custom SOL amount", // placeholder of the text input
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
