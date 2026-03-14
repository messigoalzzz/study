import { NextResponse } from "next/server";

const GUILD_ID = process.env.DISCORD_GUILD_ID ?? "1482288954798772339";
const ENABLE_INVITES = true;
const ENABLE_DMS = true;

function isoAfter24h(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export async function POST() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return NextResponse.json(
      { success: false, error: "未配置 BOT_TOKEN，请在 Vercel/本地环境变量中设置" },
      { status: 500 }
    );
  }

  try {
    const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/incident-actions`;
    const payload = {
      invites_disabled_until: ENABLE_INVITES ? isoAfter24h() : null,
      dms_disabled_until: ENABLE_DMS ? isoAfter24h() : null,
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "DiscordBot (manual-incident-script, 1.0)",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: text || `Discord API 返回 ${res.status}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Discord 24 小时保护已设置，将自动恢复",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求 Discord 时出错";
    console.error("Raid protection error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
