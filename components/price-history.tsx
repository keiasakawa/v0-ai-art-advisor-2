"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface PriceHistoryEntry {
  date: string
  event: string
  price: number
  changePercent?: number
  pricePerUnit?: number
  unitLabel?: string
  source?: string
  sourceUrl?: string
}

interface PriceHistoryProps {
  entries: PriceHistoryEntry[]
  currency?: string
  initialVisibleCount?: number
}

export function PriceHistory({ entries, currency = "US$", initialVisibleCount = 3 }: PriceHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleEntries = isExpanded ? entries : entries.slice(0, initialVisibleCount)
  const hasMore = entries.length > initialVisibleCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-lg border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">Price History</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {entries.length} recorded transaction{entries.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-b bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price/Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {visibleEntries.map((entry, index) => (
                <motion.tr
                  key={`${entry.date}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{entry.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.event === "Sold"
                          ? "bg-green-100 text-green-800"
                          : entry.event === "Listed"
                            ? "bg-blue-100 text-blue-800"
                            : entry.event === "Auction"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry.event}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium whitespace-nowrap">
                    {currency}
                    {entry.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                    {entry.changePercent !== undefined ? (
                      <span
                        className={
                          entry.changePercent > 0
                            ? "text-green-600"
                            : entry.changePercent < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }
                      >
                        {entry.changePercent > 0 ? "+" : ""}
                        {entry.changePercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                    {entry.pricePerUnit !== undefined ? (
                      <span>
                        {currency}
                        {entry.pricePerUnit.toFixed(2)}
                        {entry.unitLabel && (
                          <span className="text-muted-foreground text-xs ml-1">/{entry.unitLabel}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {entry.source ? (
                      entry.sourceUrl ? (
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {entry.source}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{entry.source}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        <AnimatePresence>
          {visibleEntries.map((entry, index) => (
            <motion.div
              key={`mobile-${entry.date}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.event === "Sold"
                      ? "bg-green-100 text-green-800"
                      : entry.event === "Listed"
                        ? "bg-blue-100 text-blue-800"
                        : entry.event === "Auction"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.event}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">
                  {currency}
                  {entry.price.toLocaleString()}
                </span>
                {entry.changePercent !== undefined && (
                  <span
                    className={`text-sm ${
                      entry.changePercent > 0
                        ? "text-green-600"
                        : entry.changePercent < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {entry.changePercent > 0 ? "+" : ""}
                    {entry.changePercent.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {entry.pricePerUnit !== undefined && (
                  <span>
                    {currency}
                    {entry.pricePerUnit.toFixed(2)}
                    {entry.unitLabel && `/${entry.unitLabel}`}
                  </span>
                )}
                {entry.source && <span className="text-xs">{entry.source}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse Button */}
      {hasMore && (
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show {entries.length - initialVisibleCount} More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
