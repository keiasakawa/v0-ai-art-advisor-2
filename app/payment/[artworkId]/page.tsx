import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Truck, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ArtworkCheckout from "@/components/artwork-checkout"
import { getArtworkWithListing } from "@/app/actions/artwork"

interface PageProps {
  params: Promise<{ artworkId: string }>
}

export default async function PaymentPage({ params }: PageProps) {
  const { artworkId } = await params
  const result = await getArtworkWithListing(artworkId)

  if (!result.success || !result.data) {
    notFound()
  }

  const { artwork, listing } = result.data

  // Determine price: prefer listing price, fall back to desired_price, then purchase_price
  const rawPrice =
    listing?.price ??
    artwork.desired_price ??
    artwork.purchase_price ??
    0

  const priceInCents = Math.round(Number(rawPrice) * 100)
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rawPrice))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href={`/artwork/${artworkId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
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
                      src={artwork.image_url || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{artwork.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {artwork.artist}
                      {artwork.year ? `, ${artwork.year}` : ""}
                    </p>
                    {artwork.medium && (
                      <p className="text-muted-foreground text-sm mt-1">{artwork.medium}</p>
                    )}
                    {artwork.dimensions && (
                      <p className="text-muted-foreground text-sm">{artwork.dimensions}</p>
                    )}
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
                imageUrl={artwork.image_url}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
