'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startArtworkCheckoutSession } from '@/app/actions/stripe'
import { markListingAsSold } from '@/app/actions/listings'

interface ArtworkCheckoutProps {
  artworkId: string
  title: string
  artist: string
  priceInCents: number
  imageUrl?: string
  stripePublishableKey?: string
}

export default function ArtworkCheckout({ 
  artworkId, 
  title, 
  artist, 
  priceInCents,
  imageUrl,
  stripePublishableKey,
}: ArtworkCheckoutProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const stripePromise = useMemo(() => {
    const key = stripePublishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    return key ? loadStripe(key) : null
  }, [stripePublishableKey])

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

  const handleComplete = useCallback(async () => {
    setIsProcessing(true)
    await markListingAsSold(artworkId)
    router.push('/payment/success')
  }, [artworkId, router])

  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Stripe is not configured. Add{' '}
        <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
        your environment variables to enable checkout.
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Processing your order...
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret, onComplete: handleComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
