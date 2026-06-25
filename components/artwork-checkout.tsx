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
  title: string
  artist: string
  priceInCents: number
  imageUrl?: string
}

export default function ArtworkCheckout({ 
  artworkId, 
  title, 
  artist, 
  priceInCents,
  imageUrl 
}: ArtworkCheckoutProps) {
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    return key ? loadStripe(key) : null
  }, [])

  const fetchClientSecret = useCallback(
    () => startArtworkCheckoutSession({ 
      artworkId, 
      title, 
      artist, 
      priceInCents,
      imageUrl 
    }),
    [artworkId, title, artist, priceInCents, imageUrl]
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
