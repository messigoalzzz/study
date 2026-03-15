'use client'

import React, { useState } from 'react'

interface SimulatedTransaction {
  coin: 'USDT'
  amount: string
  network: 'TRX'
  date: string
  id: string
  address: string
}

type CopyStatus = 'idle' | 'success' | 'failed'

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
    return `{ coin: 'USDT', amount: '${item.amount}', network: 'TRX', date: '${item.date}', id: '${item.id}', address: '${item.address}' },`
  })

  return rows.join('\n')
}

const Page = () => {
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const [copied, setCopied] = useState<string | null>(null)
  const [salary, setSalary] = useState('6000')
  const [startDate, setStartDate] = useState(formatDateInput(defaultStart))
  const [endDate, setEndDate] = useState(formatDateInput(defaultEnd))
  const [payday, setPayday] = useState('15')
  const [generatingTransactions, setGeneratingTransactions] = useState(false)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>([])
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [copyStatusText, setCopyStatusText] = useState('')
  const [raidProtectionLoading, setRaidProtectionLoading] = useState(false)
  const [raidProtectionResult, setRaidProtectionResult] = useState<{ ok: boolean; message: string } | null>(null)

  const writeTextToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }

    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.pointerEvents = 'none'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const copiedWithFallback = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (!copiedWithFallback) {
      throw new Error('当前浏览器不支持自动复制')
    }
  }

  const copyToClipboard = async (text: string, type: string, silent = false) => {
    try {
      await writeTextToClipboard(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 5000)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      if (!silent) {
        alert('复制失败')
      }
      return false
    }
  }

  const generateSalaryTransactions = async () => {
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

    setGeneratingTransactions(true)
    setCopyStatus('idle')
    setCopyStatusText('')

    try {
      const walletResponse = await fetch('/api/generate-wallet', { cache: 'no-store' })
      const walletResult = await walletResponse.json()

      if (!walletResponse.ok || !walletResult.success || !walletResult.data?.address) {
        const errorMessage = walletResult.error ?? '无法生成真实 Tron 地址'
        throw new Error(errorMessage)
      }

      const incomeAddress = walletResult.data.address as string
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

      const nextTransactions = [...generated].reverse()
      const generatedCode = buildTransactionsCode(nextTransactions)

      setSimulatedTransactions(nextTransactions)
      setTransactionError(null)
      setCopied(null)

      const autoCopied = await copyToClipboard(generatedCode, 'transactions', true)
      if (autoCopied) {
        setCopyStatus('success')
        setCopyStatusText(`刚生成的 ${nextTransactions.length} 条数据已自动复制到剪贴板`)
      } else {
        setCopyStatus('failed')
        setCopyStatusText('数据已生成，但自动复制失败，请点击下方按钮手动复制')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成工资流水失败'
      setTransactionError(message)
      setSimulatedTransactions([])
      setCopyStatus('idle')
      setCopyStatusText('')
    } finally {
      setGeneratingTransactions(false)
    }
  }

  const transactionsCode = buildTransactionsCode(simulatedTransactions)

  const runRaidProtection = async () => {
    setRaidProtectionLoading(true)
    setRaidProtectionResult(null)
    try {
      const res = await fetch('/api/raid-protection', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setRaidProtectionResult({ ok: true, message: data.message ?? '已设置 24 小时后自动恢复' })
      } else {
        setRaidProtectionResult({ ok: false, message: data.error ?? '执行失败' })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '请求失败'
      setRaidProtectionResult({ ok: false, message: msg })
    } finally {
      setRaidProtectionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={runRaidProtection}
            disabled={raidProtectionLoading}
            className="rounded-lg border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            {raidProtectionLoading ? '执行中...' : '执行 Discord 24h 保护脚本'}
          </button>
        </div>
        {raidProtectionResult && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              raidProtectionResult.ok
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
          >
            {raidProtectionResult.ok ? '✓ ' : '✗ '}
            {raidProtectionResult.message}
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              工资流水模拟器
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              输入工资、时间范围、发薪日，按月生成可直接粘贴到数组中的对象片段（周末自动顺延到周一）
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

            <div className="mt-8 flex justify-center">
              <button
                onClick={generateSalaryTransactions}
                disabled={generatingTransactions}
                className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
              >
                {generatingTransactions ? '生成中...' : '生成工资流水数组'}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
              点击生成后会自动复制结果到剪贴板
            </p>

            {transactionError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {transactionError}
              </p>
            )}

            {simulatedTransactions.length > 0 && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {copyStatus !== 'idle' && (
                  <div
                    className={`mb-4 rounded-xl border-2 p-4 shadow-sm ${
                      copyStatus === 'success'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
                          copyStatus === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {copyStatus === 'success' ? 'OK' : '!'}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-base font-extrabold ${
                            copyStatus === 'success'
                              ? 'text-emerald-800 dark:text-emerald-200'
                              : 'text-amber-800 dark:text-amber-200'
                          }`}
                        >
                          {copyStatus === 'success' ? '已复制到剪贴板' : '自动复制失败'}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            copyStatus === 'success'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {copyStatusText}
                        </p>
                      </div>
                      {copyStatus === 'success' && (
                        <div className="ml-2 hidden h-10 items-end gap-1 sm:flex">
                          <span className="h-3 w-1.5 rounded-sm bg-emerald-500/80" />
                          <span className="h-5 w-1.5 rounded-sm bg-emerald-500" />
                          <span className="h-8 w-1.5 rounded-sm bg-emerald-500/90" />
                          <span className="h-6 w-1.5 rounded-sm bg-emerald-500/80" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    生成结果（共 {simulatedTransactions.length} 条，可直接粘贴到数组中）
                  </label>
                  <button
                    onClick={async () => {
                      const isCopied = await copyToClipboard(transactionsCode, 'transactions')
                      if (isCopied) {
                        setCopyStatus('success')
                        setCopyStatusText('已手动复制成功，可直接粘贴')
                      } else {
                        setCopyStatus('failed')
                        setCopyStatusText('复制失败，请检查浏览器剪贴板权限')
                      }
                    }}
                    className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors ${
                      copied === 'transactions'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
                    }`}
                  >
                    {copied === 'transactions' ? '已复制到剪贴板' : '复制片段'}
                  </button>
                </div>
                <pre className="text-xs text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
                  {transactionsCode}
                </pre>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Page
