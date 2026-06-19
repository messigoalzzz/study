import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy

if (proxyUrl && process.env.NODE_ENV !== 'production') {
  // Node 的 fetch 默认不读 *_proxy 环境变量，本地开发时手动挂上代理
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ProxyAgent, setGlobalDispatcher } = require('undici')
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
  console.log('[db] Using HTTP proxy for Neon:', proxyUrl)
} else {
  console.log('[db] No proxy configured. NODE_ENV =', process.env.NODE_ENV)
}

export const sql = neon(process.env.DATABASE_URL)
