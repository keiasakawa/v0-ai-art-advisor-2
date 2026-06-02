"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setupDemoAccounts } from "@/app/actions/setup-demo-accounts"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SetupDemoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    results?: { email: string; success: boolean; error?: string }[]
    error?: string
  } | null>(null)

  const handleSetup = async () => {
    setIsRunning(true)
    setResults(null)
    
    try {
      const result = await setupDemoAccounts()
      setResults(result)
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Setup Demo Accounts</CardTitle>
          <CardDescription>
            Create or update demo accounts for testing the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>This will create the following demo accounts:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>buyer@demo.offcanvas.art</strong> - Collector/Buyer role</li>
              <li><strong>seller@demo.offcanvas.art</strong> - Seller + Buyer roles</li>
              <li><strong>curator@demo.offcanvas.art</strong> - Curator + Buyer roles</li>
            </ul>
            <p className="text-xs mt-2">All passwords will be set to match the account type (e.g., demobuyer123).</p>
          </div>

          <Button onClick={handleSetup} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up accounts...
              </>
            ) : (
              "Setup Demo Accounts"
            )}
          </Button>

          {results && (
            <div className="space-y-2 pt-4 border-t">
              {results.error && !results.results && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <XCircle className="h-4 w-4" />
                  {results.error}
                </div>
              )}
              
              {results.results?.map((r) => (
                <div
                  key={r.email}
                  className={`flex items-center gap-2 text-sm ${
                    r.success ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {r.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>{r.email}</span>
                  {r.error && <span className="text-xs">({r.error})</span>}
                </div>
              ))}

              {results.success && (
                <p className="text-sm text-green-600 font-medium pt-2">
                  All demo accounts are ready! You can now use them on the login page.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
