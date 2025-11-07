'use client'

import React, { useState } from 'react'

interface WalletData {
  privateKey?: string
  publicKey?: string
  address?: string
}

const Page = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generateWallet = async () => {
    setLoading(true)
    setWallet(null)
    setCopied(null)
    
    try {
      const response = await fetch('/api/generate-wallet')
      const result = await response.json()
      
      if (result.success) {
        setWallet(result.data)
      } else {
        alert('生成钱包失败: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('生成钱包时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('复制失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tron 钱包生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            点击按钮生成新的 Tron 钱包地址、私钥和公钥
          </p>

          <button
            onClick={generateWallet}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? '生成中...' : '生成新钱包'}
          </button>

          {wallet && (
            <div className="mt-8 space-y-6">
              {/* 地址 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tron 地址
                  </label>
                  <button
                    onClick={() => wallet.address && copyToClipboard(wallet.address, 'address')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {copied === 'address' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
                <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                  {wallet.address}
                </p>
              </div>

              {/* 私钥 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    私钥 (Private Key)
                  </label>
                  <button
                    onClick={() => wallet.privateKey && copyToClipboard(wallet.privateKey, 'privateKey')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {copied === 'privateKey' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
                <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                  {wallet.privateKey}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  ⚠️ 请妥善保管私钥，不要泄露给任何人
                </p>
              </div>

              {/* 公钥 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    公钥 (Public Key)
                  </label>
                  <button
                    onClick={() => wallet.publicKey && copyToClipboard(wallet.publicKey, 'publicKey')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {copied === 'publicKey' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
                <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                  {wallet.publicKey}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page