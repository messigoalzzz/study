import { NextResponse } from "next/server";
import { TronWeb } from "tronweb";

export async function GET() {
  try {
    // 初始化 TronWeb
    const tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
    });

    // 生成新钱包
    const account = await tronWeb.createAccount();

    // 获取地址（Base58 格式）
    const address = account.address.base58;

    // 获取私钥（十六进制格式）
    const privateKey = account.privateKey;

    // 获取公钥（account 对象已包含 publicKey）
    const publicKey = account.publicKey;

    return NextResponse.json({
      success: true,
      data: {
        address: address,
        privateKey: privateKey,
        publicKey: publicKey,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error generating wallet:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate wallet",
      },
      { status: 500 }
    );
  }
}

