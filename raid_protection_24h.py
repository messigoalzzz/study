
import os
import sys

import requests
from datetime import datetime, timedelta, timezone

# BOT_TOKEN 从环境变量读取（在 .env.local 中配置）
BOT_TOKEN = os.environ.get("BOT_TOKEN")
if not BOT_TOKEN:
    print("错误：未设置环境变量 BOT_TOKEN，请在 .env.local 中配置")
    sys.exit(1)

# ====== 改这里（或后续也可改为环境变量） ======
GUILD_ID = "1482288954798772339"

# True = 开启该项，False = 不动该项
ENABLE_INVITES = True   # 暂停邀请
ENABLE_DMS = True       # 暂停私信
# ===================


def iso_after_24h():
    return (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()


def main():
    url = f"https://discord.com/api/v10/guilds/{GUILD_ID}/incident-actions"

    payload = {
        "invites_disabled_until": iso_after_24h() if ENABLE_INVITES else None,
        "dms_disabled_until": iso_after_24h() if ENABLE_DMS else None,
    }

    headers = {
        "Authorization": f"Bot {BOT_TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "DiscordBot (manual-incident-script, 1.0)",
    }

    print("正在提交：")
    print(payload)

    resp = requests.put(url, json=payload, headers=headers, timeout=30)

    print("\n状态码:", resp.status_code)
    print("返回内容:")
    print(resp.text)

    if resp.ok:
        print("\n成功：已设置为 24 小时后自动恢复。")
    else:
        print("\n失败：请检查 Bot 权限、服务器 ID、Token 是否正确。")

    resp.raise_for_status()


if __name__ == "__main__":
    main()