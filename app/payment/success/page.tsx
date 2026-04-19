'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCheckoutSessionStatus } from '@/app/actions/stripe'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [status, setStatus] = useState<{
    status: string | null
    paymentStatus: string
    customerEmail: string | null | undefined
    artworkId: string | undefined
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      getCheckoutSessionStatus(sessionId)
        .then(setStatus)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Confirming your payment...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Confirmation Email</p>
              <p className="text-sm text-muted-foreground">
                {status?.customerEmail 
                  ? `Sent to ${status.customerEmail}` 
                  : 'A confirmation email will be sent shortly'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Shipping</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll notify you when your artwork ships
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/my-collection">
              View My Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/browse">Continue Browsing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Confirming your payment...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
