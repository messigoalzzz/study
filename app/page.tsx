'use client'

import React, { useEffect, useState } from 'react'

interface SimulatedTransaction {
  coin: 'USDT'
  amount: string
  network: 'TRX'
  date: string
  id: string
  address: string
}

interface SalaryHistoryRecord {
  id: string
  generatedAt: string
  generatedAtTimestamp: number
  salary: string
  startDate: string
  endDate: string
  payday: string
  annualBonusMonths: string
  transactions: SimulatedTransaction[]
}

type CopyStatus = 'idle' | 'success' | 'failed'

const HEX_ALPHABET = '0123456789abcdef'
const HISTORY_STORAGE_KEY = 'salary-generation-history'
const HISTORY_DISPLAY_LIMIT = 5
const HISTORY_STORAGE_LIMIT = 10

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

const parseIntegerInput = (value: string) => {
  if (!value.trim()) {
    return Number.NaN
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : Number.NaN
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

const createPayrollDate = (year: number, monthIndex: number, payDay: number, withRandomTime = false) => {
  const maxDay = getDaysInMonth(year, monthIndex)
  const safeDay = Math.min(payDay, maxDay)
  const payrollDate = new Date(
    year,
    monthIndex,
    safeDay,
    withRandomTime ? randomInt(9, 18) : 12,
    withRandomTime ? randomInt(0, 59) : 0,
    withRandomTime ? randomInt(0, 59) : 0,
    0
  )

  adjustWeekendToMonday(payrollDate)
  return payrollDate
}

const rangeIncludesFebruaryPayroll = (rangeStart: Date, rangeEnd: Date, payDay: number) => {
  const startBoundary = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    rangeStart.getDate(),
    0,
    0,
    0,
    0
  )
  const endBoundary = new Date(
    rangeEnd.getFullYear(),
    rangeEnd.getMonth(),
    rangeEnd.getDate(),
    23,
    59,
    59,
    999
  )

  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
  const monthLimit = 240
  let monthSteps = 0

  while (cursor.getTime() <= endBoundary.getTime() && monthSteps < monthLimit) {
    const year = cursor.getFullYear()
    const monthIndex = cursor.getMonth()

    if (monthIndex === 1) {
      const payrollDate = createPayrollDate(year, monthIndex, payDay)
      if (payrollDate.getTime() >= startBoundary.getTime() && payrollDate.getTime() <= endBoundary.getTime()) {
        return true
      }
    }

    cursor = new Date(year, monthIndex + 1, 1)
    monthSteps += 1
  }

  return false
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

const getDateTimeValue = (dateText: string) => {
  const timestamp = new Date(dateText.replace(' ', 'T')).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortTransactionsByDateDesc = (transactions: SimulatedTransaction[]) => {
  return [...transactions].sort((a, b) => getDateTimeValue(b.date) - getDateTimeValue(a.date))
}

const getRecentSalaryHistory = (records: SalaryHistoryRecord[]) => {
  return [...records]
    .sort((a, b) => b.generatedAtTimestamp - a.generatedAtTimestamp)
    .slice(0, HISTORY_STORAGE_LIMIT)
}

const isSimulatedTransaction = (value: unknown): value is SimulatedTransaction => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Record<string, unknown>
  return (
    item.coin === 'USDT' &&
    typeof item.amount === 'string' &&
    item.network === 'TRX' &&
    typeof item.date === 'string' &&
    typeof item.id === 'string' &&
    typeof item.address === 'string'
  )
}

const isSalaryHistoryRecord = (value: unknown): value is SalaryHistoryRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.generatedAt === 'string' &&
    typeof item.generatedAtTimestamp === 'number' &&
    typeof item.salary === 'string' &&
    typeof item.startDate === 'string' &&
    typeof item.endDate === 'string' &&
    typeof item.payday === 'string' &&
    typeof item.annualBonusMonths === 'string' &&
    Array.isArray(item.transactions) &&
    item.transactions.every(isSimulatedTransaction)
  )
}

const readSalaryHistory = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!rawHistory) {
      return []
    }

    const parsedHistory = JSON.parse(rawHistory)
    if (!Array.isArray(parsedHistory)) {
      return []
    }

    return getRecentSalaryHistory(parsedHistory.filter(isSalaryHistoryRecord))
  } catch (error) {
    console.error('Failed to read salary history:', error)
    return []
  }
}

const saveSalaryHistory = (records: SalaryHistoryRecord[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('Failed to save salary history:', error)
  }
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
  const [annualBonusMonths, setAnnualBonusMonths] = useState('0')
  const [generatingTransactions, setGeneratingTransactions] = useState(false)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>([])
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryRecord[]>([])
  const [selectedHistoryRecordId, setSelectedHistoryRecordId] = useState<string | null>(null)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [copyStatusText, setCopyStatusText] = useState('')

  useEffect(() => {
    setSalaryHistory(readSalaryHistory())
  }, [])

  const parsedStartDate = parseDateInput(startDate)
  const parsedEndDate = parseDateInput(endDate)
  const parsedPayDay = parseIntegerInput(payday)
  const canEvaluateAnnualBonusRange =
    parsedStartDate !== null &&
    parsedEndDate !== null &&
    parsedStartDate.getTime() <= parsedEndDate.getTime() &&
    !Number.isNaN(parsedPayDay) &&
    parsedPayDay >= 1 &&
    parsedPayDay <= 31
  const shouldShowAnnualBonusField = canEvaluateAnnualBonusRange
    ? rangeIncludesFebruaryPayroll(parsedStartDate, parsedEndDate, parsedPayDay)
    : false

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

  const addSalaryHistoryRecord = (
    transactions: SimulatedTransaction[],
    annualBonusMonthCount: number
  ) => {
    const generatedAt = new Date()
    const generatedAtTimestamp = generatedAt.getTime()
    const historyRecord: SalaryHistoryRecord = {
      id: `${generatedAtTimestamp}-${generateHex(8)}`,
      generatedAt: formatDateTime(generatedAt),
      generatedAtTimestamp,
      salary: salary.trim(),
      startDate,
      endDate,
      payday,
      annualBonusMonths: shouldShowAnnualBonusField ? String(annualBonusMonthCount) : '0',
      transactions,
    }

    setSelectedHistoryRecordId(historyRecord.id)
    setSalaryHistory((currentHistory) => {
      const nextHistory = getRecentSalaryHistory([historyRecord, ...currentHistory])
      saveSalaryHistory(nextHistory)
      return nextHistory
    })
  }

  const showHistoryRecord = (record: SalaryHistoryRecord) => {
    setSimulatedTransactions(record.transactions)
    setSelectedHistoryRecordId(record.id)
    setCopyStatus('idle')
    setCopyStatusText('')
    setCopied(null)
    setHistoryModalOpen(false)
  }

  const generateSalaryTransactions = async () => {
    const baseSalary = Number.parseFloat(salary)
    const payDay = parseIntegerInput(payday)
    const rangeStart = parseDateInput(startDate)
    const rangeEnd = parseDateInput(endDate)
    const annualBonusMonthCount = shouldShowAnnualBonusField
      ? parseIntegerInput(annualBonusMonths)
      : 0

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

    if (
      shouldShowAnnualBonusField &&
      (Number.isNaN(annualBonusMonthCount) || annualBonusMonthCount < 0)
    ) {
      setTransactionError('年终奖月数请输入大于等于 0 的整数')
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
        const txDate = createPayrollDate(year, monthIndex, payDay, true)

        if (txDate.getTime() >= startBoundary.getTime() && txDate.getTime() <= endBoundary.getTime()) {
          const isFebruaryPayroll = monthIndex === 1
          const salaryBase =
            isFebruaryPayroll && annualBonusMonthCount > 0
              ? baseSalary * (annualBonusMonthCount + 1)
              : baseSalary
          const salaryOffset =
            isFebruaryPayroll && annualBonusMonthCount > 0
              ? randomBetween(-2, 2)
              : randomBetween(-3, 3)
          const txAmount =
            salaryBase + salaryOffset

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
        setSelectedHistoryRecordId(null)
        return
      }

      const nextTransactions = sortTransactionsByDateDesc(generated)
      const generatedCode = buildTransactionsCode(nextTransactions)

      setSimulatedTransactions(nextTransactions)
      addSalaryHistoryRecord(nextTransactions, annualBonusMonthCount)
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
      setSelectedHistoryRecordId(null)
      setCopyStatus('idle')
      setCopyStatusText('')
    } finally {
      setGeneratingTransactions(false)
    }
  }

  const transactionsCode = buildTransactionsCode(simulatedTransactions)
  const visibleSalaryHistory = salaryHistory.slice(0, HISTORY_DISPLAY_LIMIT)
  const hasMoreSalaryHistory = salaryHistory.length > HISTORY_DISPLAY_LIMIT
  const selectedHistoryIndex = selectedHistoryRecordId
    ? salaryHistory.findIndex((record) => record.id === selectedHistoryRecordId)
    : -1
  const selectedResultNumber = selectedHistoryIndex >= 0 ? selectedHistoryIndex + 1 : 1
  const renderSalaryHistoryRecord = (record: SalaryHistoryRecord, index: number) => {
    const bonusMonthCount = Number.parseInt(record.annualBonusMonths, 10)
    const isSelected = record.id === selectedHistoryRecordId

    return (
      <article
        key={record.id}
        role="button"
        tabIndex={0}
        onClick={() => showHistoryRecord(record)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            showHistoryRecord(record)
          }
        }}
        className={
          isSelected
            ? 'group cursor-pointer rounded-lg bg-gradient-to-r from-fuchsia-500 via-blue-500 to-emerald-500 p-[2px] shadow-lg shadow-blue-500/20 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900'
            : 'group cursor-pointer rounded-lg border border-gray-200 bg-white outline-none transition-all hover:border-blue-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:focus-visible:ring-offset-gray-900'
        }
      >
        <div className={isSelected ? 'rounded-[6px] bg-white p-4 dark:bg-gray-800' : 'p-4'}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  #{index + 1}
                </p>
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-700/60">
                  {record.generatedAt}
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  共 {record.transactions.length} 条流水
                </span>
                {isSelected && (
                  <span className="rounded-full bg-gradient-to-r from-fuchsia-500 via-blue-500 to-emerald-500 px-2 py-0.5 text-xs font-extrabold text-white shadow-sm">
                    当前结果
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {record.startDate} 至 {record.endDate}，发薪日 {record.payday} 日，月工资 {record.salary} USDT
                {bonusMonthCount > 0 ? `，年终奖 ${bonusMonthCount} 个月` : ''}
              </p>
            </div>
            <span className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300">
              查看结果
            </span>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              工资流水模拟器
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              输入工资、时间范围、发薪日，按月生成可直接粘贴到数组中的对象片段（周末自动顺延到周一，范围包含 2 月发薪时可额外叠加年终奖）
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

            <div className={`grid gap-4 mt-4 ${shouldShowAnnualBonusField ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
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

              {shouldShowAnnualBonusField && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    年终奖（月）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={annualBonusMonths}
                    onChange={(event) => setAnnualBonusMonths(event.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="例如 2"
                  />
                </div>
              )}
            </div>

            {canEvaluateAnnualBonusRange && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {shouldShowAnnualBonusField
                  ? '当前时间范围包含 2 月发薪记录，已显示年终奖（月）字段，2 月工资会按月工资叠加年终奖月数生成。'
                  : '当前时间范围不包含 2 月发薪记录，已隐藏年终奖（月）字段。'}
              </p>
            )}

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

            {(simulatedTransactions.length > 0 || salaryHistory.length > 0) && (
              <div className="mt-6 flex flex-col gap-6 border-t border-gray-200 pt-6 dark:border-gray-700 lg:flex-row lg:items-start">
                {simulatedTransactions.length > 0 && (
                  <div className={`min-w-0 ${salaryHistory.length > 0 ? 'lg:flex-[3]' : 'w-full'}`}>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
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
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                                copyStatus === 'success'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {copyStatus === 'success' ? 'OK' : '!'}
                            </div>
                            <div className="min-w-0 flex-1">
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
                      <div className="mb-3 flex items-center justify-between">
                        <label className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          <span className="rounded-md bg-gradient-to-r from-fuchsia-500 via-blue-500 to-emerald-500 px-2 py-0.5 text-xs font-extrabold text-white shadow-sm">
                            #{selectedResultNumber}
                          </span>
                          <span className="bg-gradient-to-r from-fuchsia-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent dark:from-fuchsia-300 dark:via-sky-300 dark:to-emerald-300">
                            生成结果（共 {simulatedTransactions.length} 条）
                          </span>
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
                          className={`shrink-0 rounded-md px-3 py-1 text-sm font-semibold transition-colors ${
                            copied === 'transactions'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
                          }`}
                        >
                          {copied === 'transactions' ? '已复制到剪贴板' : '复制片段'}
                        </button>
                      </div>
                      <pre className="max-h-[60vh] overflow-y-auto text-xs text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
                        {transactionsCode}
                      </pre>
                    </div>
                  </div>
                )}

                {salaryHistory.length > 0 && (
                  <div className={`min-w-0 ${simulatedTransactions.length > 0 ? 'lg:flex-[2]' : 'w-full'}`}>
                    <section>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            历史记录
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            展示最近 {visibleSalaryHistory.length} 次，保留 {HISTORY_STORAGE_LIMIT} 次
                          </p>
                        </div>
                        {hasMoreSalaryHistory && (
                          <button
                            onClick={() => setHistoryModalOpen(true)}
                            className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          >
                            More
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {visibleSalaryHistory.map((record, index) => renderSalaryHistoryRecord(record, index))}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}

            {historyModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-modal-title"
                onClick={() => setHistoryModalOpen(false)}
              >
                <div
                  className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <h3 id="history-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
                        更多历史记录
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        展开显示已保留的最近 {salaryHistory.length} 次生成
                      </p>
                    </div>
                    <button
                      onClick={() => setHistoryModalOpen(false)}
                      className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="max-h-[calc(85vh-88px)] space-y-3 overflow-y-auto p-4">
                    {salaryHistory.map((record, index) => renderSalaryHistoryRecord(record, index))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
