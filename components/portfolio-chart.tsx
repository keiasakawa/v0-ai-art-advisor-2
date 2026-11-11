"use client"

import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PortfolioData } from "@/app/actions/portfolio"

const RANGES = { "1M": 1, "3M": 3, "1Y": 12, ALL: null } as const
type Range = keyof typeof RANGES

const DAY = 24 * 60 * 60 * 1000

interface Point {
  t: number
  value: number
  invested: number
}

function startOfDay(t: number) {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Collection value and amount invested over time, from when each artwork
 * entered and left the collection. Changes on the same day are combined.
 */
export function buildHistory(data: PortfolioData, range: Range, now: Date): Point[] {
  const byDay = new Map<number, { value: number; invested: number }>()
  const add = (iso: string, value: number, invested: number) => {
    const day = startOfDay(new Date(iso).getTime())
    const cur = byDay.get(day) ?? { value: 0, invested: 0 }
    cur.value += value
    cur.invested += invested
    byDay.set(day, cur)
  }
  for (const h of data.holdings) add(h.acquiredAt, h.currentValue, h.costBasis ?? 0)
  for (const s of data.sales) {
    add(s.acquiredAt, s.heldValue, s.costBasis ?? 0)
    add(s.soldAt, -s.heldValue, -(s.costBasis ?? 0))
  }
  const days = [...byDay.entries()].sort((a, b) => a[0] - b[0])
  if (days.length === 0) return []

  const end = now.getTime()
  const months = RANGES[range]
  let start: number
  if (months == null) {
    start = days[0][0]
  } else {
    const d = new Date(now)
    d.setMonth(d.getMonth() - months)
    start = startOfDay(d.getTime())
  }

  let value = 0
  let invested = 0
  let i = 0
  while (i < days.length && days[i][0] <= start) {
    value += days[i][1].value
    invested += days[i][1].invested
    i++
  }
  const points: Point[] = [{ t: start, value, invested }]
  for (; i < days.length && days[i][0] <= end; i++) {
    value += days[i][1].value
    invested += days[i][1].invested
    points.push({ t: days[i][0], value, invested })
  }
  // Extend to today so the line reaches the right edge
  if (points[points.length - 1].t < end) points.push({ t: end, value, invested })
  return points
}

function formatMoney(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function compactMoney(n: number) {
  return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`
}

function makeTickFormatter(span: number, end: number) {
  if (span <= 2 * DAY) {
    return (t: number) =>
      t === end ? "Now" : new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  if (span <= 400 * DAY) {
    return (t: number) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  return (t: number) => new Date(t).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

/** Evenly spaced X ticks; just the two ends when the span is very short */
function makeTicks(start: number, end: number) {
  if (end <= start) return [start]
  const n = end - start <= 2 * DAY ? 1 : 4
  return Array.from({ length: n + 1 }, (_, k) => Math.round(start + ((end - start) * k) / n))
}

/** Round Y ticks (0, 25K, 50K, ...) that cover the largest value */
function makeYTicks(max: number) {
  if (max <= 0) return [0, 1000]
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) as number
  const top = Math.ceil((max * 1.05) / step) * step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, k) => k * step)
}

export function PortfolioChart({ data, now }: { data: PortfolioData; now: Date }) {
  const [range, setRange] = useState<Range>("ALL")
  const points = useMemo(() => buildHistory(data, range, now), [data, range, now])

  const start = points[0]?.t ?? now.getTime()
  const end = points[points.length - 1]?.t ?? now.getTime()
  const span = end - start
  const tickFormatter = makeTickFormatter(span, end)
  const ticks = makeTicks(start, end)
  const yTicks = makeYTicks(Math.max(0, ...points.map((p) => Math.max(p.value, p.invested))))

  const first = points[0]?.value ?? 0
  const last = points[points.length - 1]?.value ?? 0
  const change = last - first

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                range === r ? "bg-background shadow-sm" : "hover:bg-background/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {points.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded" style={{ background: "var(--primary)" }} />
              Value
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded border-t-2 border-dashed border-muted-foreground" />
              Invested
            </span>
            <span>
              <span className={change >= 0 ? "text-emerald-600" : "text-red-600"}>
                {change >= 0 ? "+" : "-"}
                {formatMoney(Math.abs(change))}
              </span>{" "}
              this period
            </span>
          </div>
        )}
      </div>

      {points.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Your collection's value over time will appear here once you add or buy an artwork.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[start, end]}
              ticks={ticks}
              tickFormatter={tickFormatter}
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={56}
              domain={[0, yTicks[yTicks.length - 1]]}
              ticks={yTicks}
              tickFormatter={compactMoney}
            />
            <Tooltip
              labelFormatter={(t: number) => new Date(t).toLocaleDateString("en-US", { dateStyle: "medium" })}
              formatter={(v: number, name: string) => [formatMoney(v), name === "value" ? "Value" : "Invested"]}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Area
              type="stepAfter"
              dataKey="invested"
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="stepAfter"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#portfolioFill)"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Based on when each artwork was acquired or sold, valued at its asking price or what was paid.
      </p>
    </div>
  )
}
