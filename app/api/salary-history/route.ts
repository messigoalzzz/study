import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const HISTORY_STORAGE_LIMIT = 100

interface SimulatedTransaction {
  coin: 'USDT'
  amount: string
  network: 'TRX'
  date: string
  id: string
  address: string
}

interface SalaryHistoryRow {
  id: string
  generated_at: string
  generated_at_timestamp: string | number
  salary: string
  start_date: string
  end_date: string
  payday: string
  annual_bonus_months: string
  transactions: SimulatedTransaction[]
}

const isSimulatedTransaction = (value: unknown): value is SimulatedTransaction => {
  if (!value || typeof value !== 'object') return false
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

export async function GET() {
  try {
    const rows = (await sql`
      SELECT id, generated_at, generated_at_timestamp, salary, start_date,
             end_date, payday, annual_bonus_months, transactions
      FROM salary_history
      ORDER BY generated_at_timestamp DESC
      LIMIT ${HISTORY_STORAGE_LIMIT}
    `) as SalaryHistoryRow[]

    const records = rows.map((row) => ({
      id: row.id,
      generatedAt: row.generated_at,
      generatedAtTimestamp: Number(row.generated_at_timestamp),
      salary: row.salary,
      startDate: row.start_date,
      endDate: row.end_date,
      payday: row.payday,
      annualBonusMonths: row.annual_bonus_months,
      transactions: row.transactions,
    }))

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Failed to read salary history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read salary history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (
      !body ||
      typeof body.id !== 'string' ||
      typeof body.generatedAt !== 'string' ||
      typeof body.generatedAtTimestamp !== 'number' ||
      typeof body.salary !== 'string' ||
      typeof body.startDate !== 'string' ||
      typeof body.endDate !== 'string' ||
      typeof body.payday !== 'string' ||
      typeof body.annualBonusMonths !== 'string' ||
      !Array.isArray(body.transactions) ||
      !body.transactions.every(isSimulatedTransaction)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid record payload' },
        { status: 400 }
      )
    }

    const generatedAtIso = new Date(body.generatedAtTimestamp).toISOString()

    await sql`
      INSERT INTO salary_history (
        id, generated_at, generated_at_timestamp, salary, start_date,
        end_date, payday, annual_bonus_months, transactions
      ) VALUES (
        ${body.id}, ${generatedAtIso}, ${body.generatedAtTimestamp},
        ${body.salary}, ${body.startDate}, ${body.endDate}, ${body.payday},
        ${body.annualBonusMonths}, ${JSON.stringify(body.transactions)}
      )
      ON CONFLICT (id) DO NOTHING
    `

    await sql`
      DELETE FROM salary_history
      WHERE id IN (
        SELECT id FROM salary_history
        ORDER BY generated_at_timestamp DESC
        OFFSET ${HISTORY_STORAGE_LIMIT}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save salary history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save salary history' },
      { status: 500 }
    )
  }
}
