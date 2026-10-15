'use client'

import { useCallback, useMemo } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startArtworkCheckoutSession } from '@/app/actions/stripe'

interface ArtworkCheckoutProps {
  artworkId: string
}

export default function ArtworkCheckout({ artworkId }: ArtworkCheckoutProps) {
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    return key ? loadStripe(key) : null
  }, [])

  // On completion Stripe redirects to /payment/success, which verifies the
  // session server-side before marking the artwork as sold.
  const fetchClientSecret = useCallback(
    () => startArtworkCheckoutSession(artworkId),
    [artworkId]
  )

  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Stripe is not configured. Add{' '}
        <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
        your environment variables to enable checkout.
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
