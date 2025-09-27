'use client'
import { useEffect, useState } from 'react'

const INAPP_UA = /(FBAN|FBAV|Instagram|Line|MicroMessenger|WeChat|Weibo|QQ|Discord)/i

export const env = {
  isStandalone: (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || !!(navigator as { standalone?: boolean }).standalone,
  likelyInAppUA: INAPP_UA.test(navigator.userAgent),
  likelyWKBridge: !!(window as { webkit?: { messageHandlers?: unknown } }).webkit?.messageHandlers, // 启发式
}

export const caps = {
  share: !!navigator.share,
  clipboardWrite: !!navigator.clipboard?.writeText,
}

export const isConstrained = !env.isStandalone && (env.likelyInAppUA || env.likelyWKBridge)

interface DebugInfo {
  href: string
  ua: string
  isStandalone: boolean
  likelyInAppUA: boolean
  likelyWKBridge: boolean
  isConstrained: boolean
  shareSupport: boolean
  clipboardSupport: boolean
  referrer: string
}

const Login = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const info: DebugInfo = {
      href: location.href,
      ua: navigator.userAgent,
      isStandalone: env.isStandalone,
      likelyInAppUA: env.likelyInAppUA,
      likelyWKBridge: env.likelyWKBridge,
      isConstrained,
      shareSupport: caps.share,
      clipboardSupport: caps.clipboardWrite,
      referrer: document.referrer || '(empty)'
    }

    console.table(info)
    // 方便你在控制台继续玩
    ;(window as { __envInfo?: DebugInfo }).__envInfo = info

    // 设置调试信息到state，在页面上显示
    setDebugInfo(info)

    // 可选：?debugUA=1 时在页面里显示
    if (new URLSearchParams(location.search).get('debugUA') === '1') {
      const pre = document.createElement('pre')
      pre.style.cssText =
        'position:fixed;left:8px;right:8px;bottom:8px;max-height:60vh;overflow:auto;background:rgba(0,0,0,.8);color:#0f0;padding:12px;border-radius:8px;z-index:99999'
      pre.textContent = JSON.stringify(info, null, 2)
      document.body.appendChild(pre)
    }
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 受限环境提示 */}
      {isConstrained && (
        <div style={{
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          🚨 检测到内置浏览器环境，功能可能受限，建议在 Safari 中打开
        </div>
      )}

      {/* 调试信息显示区域 */}
      {debugInfo && (
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'yellow', 
            marginBottom: '10px', 
            textAlign: 'center' 
          }}>
            浏览器环境检测结果 (简化版)
          </div>
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan' }}>基本信息:</span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                URL: {debugInfo.href}
              </span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                User Agent: {debugInfo.ua}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'orange', marginTop: '12px' }}>环境检测:</span>
              <span style={{ fontSize: '12px', color: debugInfo.isStandalone ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Is Standalone: {debugInfo.isStandalone ? '✅ YES (独立应用)' : '❌ NO (浏览器内)'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.likelyInAppUA ? 'red' : 'lime', fontFamily: 'monospace' }}>
                In-App Browser UA: {debugInfo.likelyInAppUA ? '🚨 YES (内嵌浏览器)' : '✅ NO (原生浏览器)'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.likelyWKBridge ? 'red' : 'lime', fontFamily: 'monospace' }}>
                WK Bridge Detected: {debugInfo.likelyWKBridge ? '🚨 YES (WebKit内嵌)' : '✅ NO (非内嵌)'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: debugInfo.isConstrained ? 'red' : 'lime', marginTop: '12px' }}>
                总体判断:
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.isConstrained ? 'red' : 'lime', fontFamily: 'monospace' }}>
                Environment Constrained: {debugInfo.isConstrained ? '🚨 YES (受限环境)' : '✅ NO (正常环境)'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>API支持:</span>
              <span style={{ fontSize: '12px', color: debugInfo.shareSupport ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Share API: {debugInfo.shareSupport ? '✅ YES' : '❌ NO'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.clipboardSupport ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Clipboard Write: {debugInfo.clipboardSupport ? '✅ YES' : '❌ NO'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>来源信息:</span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Referrer: {debugInfo.referrer}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login