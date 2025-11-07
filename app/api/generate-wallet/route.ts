import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { existsSync } from "fs";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // 获取 Python 脚本的绝对路径
    const scriptPath = path.join(process.cwd(), "a.py");
    
    // 检查脚本文件是否存在
    if (!existsSync(scriptPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Python script not found. Please ensure a.py exists in the project root.",
        },
        { status: 404 }
      );
    }
    
    // 检查虚拟环境是否存在，如果不存在则使用系统 Python
    const venvPython = path.join(process.cwd(), "venv", "bin", "python");
    const pythonCommand = existsSync(venvPython) ? venvPython : "python3";
    
    // 执行 Python 脚本
    const { stdout, stderr } = await execAsync(`${pythonCommand} ${scriptPath}`);
    
    if (stderr && !stderr.includes("WARNING")) {
      console.error("Python stderr:", stderr);
    }
    
    // 解析输出
    const lines = stdout.trim().split("\n");
    const walletData: {
      privateKey?: string;
      publicKey?: string;
      address?: string;
    } = {};
    
    lines.forEach((line) => {
      if (line.startsWith("Private Key:")) {
        walletData.privateKey = line.split("Private Key:")[1].trim();
      } else if (line.startsWith("Public Key:")) {
        walletData.publicKey = line.split("Public Key:")[1].trim();
      } else if (line.startsWith("Tron Address:")) {
        walletData.address = line.split("Tron Address:")[1].trim();
      }
    });
    
    // 验证是否成功获取所有数据
    if (!walletData.privateKey || !walletData.publicKey || !walletData.address) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse wallet data from Python script output",
          debug: { stdout, stderr },
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: walletData,
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

