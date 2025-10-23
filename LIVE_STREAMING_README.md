# Agora 直播功能 Demo

这是一个基于 Agora SDK 的直播功能演示，支持主播开播和观众观看。

## 功能特性

- ✅ 主播开播功能
- ✅ 观众观看功能
- ✅ 音视频控制（静音、关闭摄像头）
- ✅ 实时音视频传输
- ✅ 简洁的 UI 界面

## 快速开始

### 1. 获取 Agora App ID

1. 访问 [Agora 控制台](https://console.agora.io/)
2. 注册/登录账号
3. 创建一个新项目
4. 获取项目的 App ID

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中配置你的 App ID：

```env
NEXT_PUBLIC_AGORA_APP_ID=你的_App_ID
```

### 3. 启动项目

```bash
yarn dev
```

### 4. 访问直播页面

打开浏览器访问：`http://localhost:3000/live`

## 使用说明

### 主播端

1. 输入频道名称（例如：`room001`）
2. 点击"开始直播（主播）"
3. 允许浏览器访问摄像头和麦克风
4. 点击"开始直播"按钮
5. 可以使用"静音"和"关闭摄像头"按钮控制音视频

### 观众端

1. 输入相同的频道名称（例如：`room001`）
2. 点击"观看直播（观众）"
3. 等待主播开播即可观看

## 测试建议

- 在两个不同的浏览器窗口或设备上测试
- 一个作为主播，另一个作为观众
- 使用相同的频道名称

## 技术栈

- Next.js 15
- React 19
- Agora RTC SDK NG
- TypeScript
- Tailwind CSS

## 注意事项

1. **App ID 必须配置**：没有 App ID 无法使用直播功能
2. **浏览器权限**：需要允许浏览器访问摄像头和麦克风
3. **HTTPS 要求**：生产环境需要使用 HTTPS
4. **Token 认证**：生产环境建议使用 Token 认证（当前为测试模式）

## 生产环境配置

在生产环境中，建议：

1. 使用 Token 认证而不是 null
2. 创建后端 API 来生成 Token
3. 添加用户认证和权限管理
4. 添加直播间管理功能
5. 添加聊天、礼物等互动功能

## 文件结构

```
app/
├── live/
│   └── page.tsx              # 直播入口页面
├── components/
│   └── live/
│       ├── Broadcaster.tsx   # 主播组件
│       └── Viewer.tsx        # 观众组件
lib/
└── agora-config.ts           # Agora 配置
.env.local                    # 环境变量配置
```

## 常见问题

### 1. 无法加入频道

- 检查 App ID 是否正确配置
- 检查网络连接
- 查看浏览器控制台错误信息

### 2. 看不到视频

- 确认已允许浏览器访问摄像头
- 确认主播已开始直播
- 检查频道名称是否一致

### 3. 听不到声音

- 确认已允许浏览器访问麦克风
- 检查主播是否静音
- 检查观众端音量设置

## 参考文档

- [Agora 官方文档](https://docs.agora.io/cn/)
- [Agora Web SDK 文档](https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web_ng/index.html)
