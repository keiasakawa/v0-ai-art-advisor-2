'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startArtworkCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
