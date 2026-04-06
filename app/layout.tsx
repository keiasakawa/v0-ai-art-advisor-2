import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { FeedbackButton } from "@/components/feedback-button"

export const metadata: Metadata = {
  title: "OFFA - AI-Powered Art Advisor",
  description:
    "Discover, learn, and collect art with confidence. OFFA combines AI expertise with curated selections to guide your art journey.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  )
}
