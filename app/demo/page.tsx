import { useEffect, useState } from 'react'

interface DebugInfo {
  href: string
  ua: string
  platform: string
  vendor: string
  language: string
  languages: readonly string[]
  maxTouchPoints: number
  isIOS: boolean
  isSafariFamily: boolean
  hasSafariObj: boolean
  hasSafariPush: boolean
  hasStandaloneProp: boolean
  standaloneVal: boolean | string | undefined
  isLikelySFVC: boolean
  referrer: string
  isAndroidDiscordReferrer: boolean
  hasShareAPI: boolean
  hasClipboardAPI: boolean
  userAgentData: unknown
  matchDisplayStandalone: boolean
}

const Login = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
  
    const ua = navigator.userAgent
    const isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  
    const isSafariFamily =
      /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
  
    // 关键点：在 iOS 的 SFVC/WKWebView 里，navigator.standalone 通常是 undefined
    const hasStandaloneProp = 'standalone' in navigator
    const standaloneVal = hasStandaloneProp ? (navigator as { standalone?: boolean }).standalone : 'undefined'
  
    const isLikelySFVC = isIOS && isSafariFamily && !hasStandaloneProp
  
    const info = {
      // 基本信息
      href: location.href,
      ua,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      languages: navigator.languages,
      maxTouchPoints: navigator.maxTouchPoints,

      // iOS/Safari 家族识别
      isIOS,
      isSafariFamily,                 // Safari(含 SFVC) 为 true；iOS Chrome/Firefox/Edge 为 false
      
      // 关键：Safari对象检测 - 区分Safari App与内嵌页的关键
      hasSafariObj: typeof (window as { safari?: { pushNotification?: unknown } }).safari !== 'undefined',
      hasSafariPush: !!(window as { safari?: { pushNotification?: unknown } }).safari?.pushNotification, // Safari App 才有
      
      hasStandaloneProp,              // Safari App/PWA 存在；SFVC/WKWebView 通常不存在
      standaloneVal,                  // PWA 独立模式为 true；Safari App 为 false

      // iOS 内嵌页（SFVC）概率判断
      isLikelySFVC,                   // 这个为 true 时，大概率就是 Discord/Telegram 等内置打开

      // 可能的来源线索（Android 才更有用）
      referrer: document.referrer || '(empty)',
      isAndroidDiscordReferrer:
        document.referrer.startsWith('android-app://') &&
        document.referrer.includes('com.discord'),

      // 其它能力（看差异，不用于强识别）
      hasShareAPI: !!navigator.share,
      hasClipboardAPI: !!navigator.clipboard,
      userAgentData: (navigator as { userAgentData?: unknown }).userAgentData || '(none)',
      matchDisplayStandalone: window.matchMedia('(display-mode: standalone)').matches
    }
  
    console.table(info)
    // 方便你在控制台继续玩
    ;(window as { __envInfo?: DebugInfo }).__envInfo = info

    // 额外的简化版调试输出
    const dump = {
      ua,
      isIOS: /iPhone|iPad|iPod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1),
      isSafariFamily: /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua),

      // 这两项是区分 Safari App 与内嵌页的关键
      hasSafariObj: typeof (window as { safari?: { pushNotification?: unknown } }).safari !== 'undefined',
      hasSafariPush: !!(window as { safari?: { pushNotification?: unknown } }).safari?.pushNotification, // Safari App 才有

      // 注意分别看"是否存在属性"和"属性值"
      hasStandaloneProp: 'standalone' in navigator,
      standaloneVal: (navigator as { standalone?: boolean }).standalone, // true/false/undefined

      referrer: document.referrer || '(empty)'
    }

    console.table(dump)
    ;(window as { __env?: typeof dump }).__env = dump

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
            浏览器环境检测结果
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
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Platform: {debugInfo.platform}
              </span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Vendor: {debugInfo.vendor}
              </span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Language: {debugInfo.language}
              </span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Max Touch Points: {debugInfo.maxTouchPoints}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>设备识别:</span>
              <span style={{ fontSize: '12px', color: debugInfo.isIOS ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Is iOS: {debugInfo.isIOS ? '✅ YES' : '❌ NO'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.isSafariFamily ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Is Safari Family: {debugInfo.isSafariFamily ? '✅ YES' : '❌ NO'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'orange', marginTop: '12px' }}>Safari对象检测 (关键区分):</span>
              <span style={{ fontSize: '12px', color: debugInfo.hasSafariObj ? 'lime' : 'red', fontFamily: 'monospace' }}>
                Has Safari Object: {debugInfo.hasSafariObj ? '✅ YES (真Safari)' : '🚨 NO (可能内嵌)'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.hasSafariPush ? 'lime' : 'red', fontFamily: 'monospace' }}>
                Has Safari Push: {debugInfo.hasSafariPush ? '✅ YES (Safari App)' : '🚨 NO (非Safari App)'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>Standalone检测:</span>
              <span style={{ fontSize: '12px', color: debugInfo.hasStandaloneProp ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Has Standalone Prop: {debugInfo.hasStandaloneProp ? '✅ YES' : '❌ NO'}
              </span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Standalone Value: {String(debugInfo.standaloneVal)}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'orange', marginTop: '12px' }}>关键判断:</span>
              <span style={{ fontSize: '12px', color: debugInfo.isLikelySFVC ? 'red' : 'lime', fontFamily: 'monospace' }}>
                Is Likely SFVC (内嵌浏览器): {debugInfo.isLikelySFVC ? '🚨 YES (可能是Discord等内嵌)' : '✅ NO (独立浏览器)'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>来源信息:</span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace' }}>
                Referrer: {debugInfo.referrer}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.isAndroidDiscordReferrer ? 'red' : 'gray', fontFamily: 'monospace' }}>
                Android Discord Referrer: {debugInfo.isAndroidDiscordReferrer ? '🚨 YES' : '❌ NO'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>API支持:</span>
              <span style={{ fontSize: '12px', color: debugInfo.hasShareAPI ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Share API: {debugInfo.hasShareAPI ? '✅ YES' : '❌ NO'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.hasClipboardAPI ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Clipboard API: {debugInfo.hasClipboardAPI ? '✅ YES' : '❌ NO'}
              </span>
              <span style={{ fontSize: '12px', color: debugInfo.matchDisplayStandalone ? 'lime' : 'gray', fontFamily: 'monospace' }}>
                Display Standalone: {debugInfo.matchDisplayStandalone ? '✅ YES' : '❌ NO'}
              </span>
              
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'cyan', marginTop: '12px' }}>User Agent:</span>
              <span style={{ fontSize: '12px', color: 'white', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {debugInfo.ua}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login