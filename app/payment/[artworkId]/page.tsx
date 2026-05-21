'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ArtworkCheckout from '@/components/artwork-checkout'
import { artworkStorage, type Artwork } from '@/lib/artwork-storage'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const artworkId = params.artworkId as string
  
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArtwork = async () => {
      const found = await artworkStorage.getById(artworkId)
      if (found) {
        setArtwork(found)
      }
      setIsLoading(false)
    }
    fetchArtwork()
  }, [artworkId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Artwork not found</h1>
        <p className="text-muted-foreground">The artwork you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild variant="outline">
          <Link href="/browse">Browse Artworks</Link>
        </Button>
      </div>
    )
  }

  const priceInCents = Math.round(parseFloat(artwork.desiredPrice || artwork.purchasePrice) * 100)
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Complete Your Purchase</h1>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                
                <div className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={artwork.imageUrl || '/placeholder.svg'}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{artwork.title}</h3>
                    <p className="text-muted-foreground text-sm">{artwork.artist}, {artwork.year}</p>
                    <p className="text-muted-foreground text-sm mt-1">{artwork.medium}</p>
                    <p className="text-muted-foreground text-sm">{artwork.dimensions}</p>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Artwork Price</span>
                    <span className="text-foreground">{priceFormatted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="text-foreground">Included</span>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground text-xl">{priceFormatted}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Buyer Protection</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Insured shipping worldwide</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">14-day return policy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stripe Checkout */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Details</h2>
              <ArtworkCheckout
                artworkId={artwork.id}
                title={artwork.title}
                artist={artwork.artist}
                priceInCents={priceInCents}
                imageUrl={artwork.imageUrl}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
