'use client'

import React, { useState } from 'react'

interface WalletData {
  privateKey?: string
  publicKey?: string
  address?: string
}

interface SimulatedTransaction {
  coin: 'USDT'
  amount: string
  network: 'TRX'
  date: string
  id: string
  address: string
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const HEX_ALPHABET = '0123456789abcdef'

const pad = (value: number) => String(value).padStart(2, '0')

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const generateHex = (length: number) => {
  let output = ''
  for (let i = 0; i < length; i += 1) {
    output += HEX_ALPHABET[Math.floor(Math.random() * HEX_ALPHABET.length)]
  }
  return output
}

const generateTronLikeAddress = () => {
  let address = 'T'
  for (let i = 1; i < 34; i += 1) {
    address += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)]
  }
  return address
}

const formatDateTime = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const formatDateInput = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const parseDateInput = (value: string) => {
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number.parseInt(yearText, 10)
  const month = Number.parseInt(monthText, 10)
  const day = Number.parseInt(dayText, 10)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }
  const parsed = new Date(year, month - 1, day)
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null
  }
  return parsed
}

const getDaysInMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate()
}

const adjustWeekendToMonday = (date: Date) => {
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 6) {
    date.setDate(date.getDate() + 2)
  } else if (dayOfWeek === 0) {
    date.setDate(date.getDate() + 1)
  }
}

const formatAmount = (value: number) => {
  const fixed = value.toFixed(4)
  const trimmed = fixed.replace(/0+$/, '')
  const [integerPart, decimalPart = ''] = trimmed.split('.')
  if (!decimalPart) {
    return `${integerPart}.000`
  }
  if (decimalPart.length >= 3) {
    return `${integerPart}.${decimalPart}`
  }
  return `${integerPart}.${decimalPart.padEnd(3, '0')}`
}

const buildTransactionsCode = (transactions: SimulatedTransaction[]) => {
  if (!transactions.length) {
    return ''
  }

  const rows = transactions.map((item) => {
    return `  { coin: 'USDT', amount: '${item.amount}', network: 'TRX', date: '${item.date}', id: '${item.id}', address: '${item.address}' },`
  })

  return ['const SIMULATED_TRANSACTIONS = [', ...rows, ']'].join('\n')
}

const Page = () => {
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [salary, setSalary] = useState('6000')
  const [startDate, setStartDate] = useState(formatDateInput(defaultStart))
  const [endDate, setEndDate] = useState(formatDateInput(defaultEnd))
  const [payday, setPayday] = useState('15')
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>([])

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

  const generateSalaryTransactions = () => {
    const baseSalary = Number.parseFloat(salary)
    const payDay = Number.parseInt(payday, 10)
    const rangeStart = parseDateInput(startDate)
    const rangeEnd = parseDateInput(endDate)

    if (Number.isNaN(baseSalary) || baseSalary <= 0) {
      setTransactionError('工资金额必须大于 0')
      return
    }

    if (!rangeStart || !rangeEnd) {
      setTransactionError('开始时间和结束时间格式不正确')
      return
    }

    if (rangeStart.getTime() > rangeEnd.getTime()) {
      setTransactionError('开始时间不能晚于结束时间')
      return
    }

    if (Number.isNaN(payDay) || payDay < 1 || payDay > 31) {
      setTransactionError('发薪日请输入 1 到 31 之间的整数')
      return
    }

    const incomeAddress = wallet?.address ?? generateTronLikeAddress()
    const startBoundary = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate(), 0, 0, 0, 0)
    const endBoundary = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate(), 23, 59, 59, 999)

    const generated: SimulatedTransaction[] = []
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    const monthLimit = 240
    let monthSteps = 0

    while (cursor.getTime() <= endBoundary.getTime() && monthSteps < monthLimit) {
      const year = cursor.getFullYear()
      const monthIndex = cursor.getMonth()
      const maxDay = getDaysInMonth(year, monthIndex)
      const safeDay = Math.min(payDay, maxDay)
      const txDate = new Date(
        year,
        monthIndex,
        safeDay,
        randomInt(9, 18),
        randomInt(0, 59),
        randomInt(0, 59),
        0
      )

      adjustWeekendToMonday(txDate)

      if (txDate.getTime() >= startBoundary.getTime() && txDate.getTime() <= endBoundary.getTime()) {
        const salaryOffset = randomBetween(-3, 3)
        const txAmount = baseSalary + salaryOffset

        generated.push({
          coin: 'USDT',
          amount: formatAmount(txAmount),
          network: 'TRX',
          date: formatDateTime(txDate),
          id: generateHex(64),
          address: incomeAddress,
        })
      }

      cursor = new Date(year, monthIndex + 1, 1)
      monthSteps += 1
    }

    if (!generated.length) {
      setTransactionError('该时间范围内没有可用发薪日，请调整时间范围')
      setSimulatedTransactions([])
      return
    }

    setSimulatedTransactions([...generated].reverse())
    setTransactionError(null)
    setCopied(null)
  }

  const transactionsCode = buildTransactionsCode(simulatedTransactions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              工资流水模拟器
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              输入工资、时间范围、发薪日，按月生成 `SIMULATED_TRANSACTIONS`（周末自动顺延到周一）
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  每月工资金额
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={salary}
                  onChange={(event) => setSalary(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="例如 6000"
                />
              </div>
            </div>

            <div className="grid gap-4 mt-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  开始时间
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  结束时间
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  发薪日 (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  value={payday}
                  onChange={(event) => setPayday(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="例如 15"
                />
              </div>
            </div>

            <button
              onClick={generateSalaryTransactions}
              className="mt-5 w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
              生成工资流水数组
            </button>

            {transactionError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {transactionError}
              </p>
            )}

            {simulatedTransactions.length > 0 && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    生成结果（共 {simulatedTransactions.length} 条）
                  </label>
                  <button
                    onClick={() => copyToClipboard(transactionsCode, 'transactions')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {copied === 'transactions' ? '✓ 已复制' : '复制数组'}
                  </button>
                </div>
                <pre className="text-xs text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
                  {transactionsCode}
                </pre>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
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
