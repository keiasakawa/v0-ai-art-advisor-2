interface CheckoutPriceInput {
  artwork: { status?: string | null; desired_price?: number | null; purchase_price?: number | null }
  listing: { listing_type?: string | null; status?: string | null; price?: number | null } | null
  highestBid: { amount: number } | null
  isAuctionEnded: boolean
  currentUserIsWinner: boolean
}

export type CheckoutPrice =
  | { ok: true; amount: number; purchaseType: "auction" | "fixed" }
  | { ok: false; error: string }

/**
 * Single source of truth for what a buyer pays for an artwork. Used both to
 * display the price and, server-side, to create the Stripe Checkout Session so
 * the client can never choose its own price.
 */
export function resolveCheckoutPrice({
  artwork,
  listing,
  highestBid,
  isAuctionEnded,
  currentUserIsWinner,
}: CheckoutPriceInput): CheckoutPrice {
  if (artwork.status === "sold" || listing?.status === "sold") {
    return { ok: false, error: "This artwork has already been sold." }
  }

  const isAuction = listing?.listing_type === "auction"

  if (isAuction) {
    if (!isAuctionEnded) {
      return { ok: false, error: "This auction is still running." }
    }
    if (!currentUserIsWinner || !highestBid) {
      return { ok: false, error: "Only the auction winner can complete this purchase." }
    }
    const amount = Number(highestBid.amount)
    return amount > 0
      ? { ok: true, amount, purchaseType: "auction" }
      : { ok: false, error: "Invalid winning bid amount." }
  }

  // Use `||` (not `??`) so a zero/invalid listing price falls through to the next source.
  const amount = Number(listing?.price || artwork.desired_price || artwork.purchase_price || 0)
  return amount > 0
    ? { ok: true, amount, purchaseType: "fixed" }
    : { ok: false, error: "This artwork does not have a valid price." }
}
