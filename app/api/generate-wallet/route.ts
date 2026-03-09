import { NextResponse } from "next/server";
import { TronWeb } from "tronweb";

export async function GET() {
  try {
    const tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
    });

    const account = await tronWeb.createAccount();

    return NextResponse.json({
      success: true,
      data: {
        address: account.address.base58,
        privateKey: account.privateKey,
        publicKey: account.publicKey,
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
