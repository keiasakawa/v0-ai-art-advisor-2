"use client"

import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EstimatedMarketValueProps {
  estimatedValue: number
  lowEstimate: number
  highEstimate: number
  lastSalePrice?: number
  lastSaleDate?: string
  priceChange?: number // percentage
  pricePerSquareInch?: number
  currency?: string
}

export function EstimatedMarketValue({
  estimatedValue,
  lowEstimate,
  highEstimate,
  lastSalePrice,
  lastSaleDate,
  priceChange,
  pricePerSquareInch,
  currency = "US$",
}: EstimatedMarketValueProps) {
  const isPositiveChange = priceChange && priceChange > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border bg-card p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Estimated Market Value</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  This estimate is based on recent sales of comparable works, artist market trends, and current demand.
                  Actual sale prices may vary.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {priceChange !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositiveChange ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositiveChange ? "+" : ""}
              {priceChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground font-normal ml-1">vs. last sale</span>
          </div>
        )}
      </div>

      {/* Main Estimated Value */}
      <div className="space-y-1">
        <div className="text-3xl font-bold">
          {currency}
          {estimatedValue.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground">OFFA AI Estimate</p>
      </div>

      {/* Sales Range */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Estimated Sales Range</p>
        <div className="relative">
          {/* Range Bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-muted-foreground/30 via-foreground to-muted-foreground/30 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
          {/* Range Labels */}
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              {currency}
              {lowEstimate.toLocaleString()}
            </span>
            <span className="font-medium">
              {currency}
              {estimatedValue.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {currency}
              {highEstimate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        {lastSalePrice && lastSaleDate && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Last Sale</p>
            <p className="font-medium">
              {currency}
              {lastSalePrice.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{lastSaleDate}</p>
          </div>
        )}
        {pricePerSquareInch && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price per sq. inch</p>
            <p className="font-medium">
              {currency}
              {pricePerSquareInch.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground pt-2 border-t">
        Estimates are for informational purposes only and do not constitute an appraisal or guarantee of value.
      </p>
    </motion.div>
  )
}
