import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "raid_protection_24h.py");
    const result = await new Promise<{ stdout: string; stderr: string; code: number | null }>(
      (resolve) => {
        const proc = spawn("python3", [scriptPath], {
          cwd: process.cwd(),
          env: { ...process.env, BOT_TOKEN: process.env.BOT_TOKEN ?? "" },
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (data) => {
          stdout += data.toString();
        });
        proc.stderr.on("data", (data) => {
          stderr += data.toString();
        });
        proc.on("close", (code) => {
          resolve({ stdout, stderr, code });
        });
        proc.on("error", (err) => {
          resolve({
            stdout: "",
            stderr: err.message,
            code: null,
          });
        });
      }
    );

    if (result.code !== 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.stderr || result.stdout || "脚本执行失败",
          stdout: result.stdout,
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Discord 24 小时保护已设置",
      stdout: result.stdout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "执行脚本时出错";
    console.error("Raid protection script error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
