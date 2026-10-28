import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Store, Truck, ShieldCheck, Lock, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "About & Policies - OFFA",
  description:
    "OFFA's Terms of Service, Marketplace Terms, Shipping and Returns Policy, Seller and Artwork Standards, and Privacy and Cookie Policy.",
}

type Section = {
  id: string
  number: number
  title: string
  icon: typeof FileText
  points: string[]
}

const sections: Section[] = [
  {
    id: "terms",
    number: 1,
    title: "Terms of Service",
    icon: FileText,
    points: [
      "Identify the legal entity operating OFFA and provide a support and legal contact method.",
      "Define account eligibility, age requirements, account security, and the invite-only nature of the Closed Beta.",
      "Require both buyers and sellers to complete identity verification before purchasing or selling. The provider and exact workflow remain to be selected.",
      "Prohibit fraud, sanctions evasion, illegal content, harassment, platform manipulation, and attempts to bypass OFFA for a transaction introduced through the platform.",
      "Define OFFA's right to review, suspend, restrict, or close accounts and to preserve records where required.",
      "Explain the license needed to display user-supplied artwork images and listing content, together with copyright and takedown procedures.",
      "State that the AI advisor provides informational recommendations only and is not an appraisal, authentication, investment, legal, or tax service. AI output may be incomplete or incorrect.",
      "Cover third-party services, disclaimers, limitation of liability, indemnity, governing law, dispute resolution, policy updates, and termination. These provisions require legal review.",
    ],
  },
  {
    id: "marketplace",
    number: 2,
    title: "Marketplace Terms",
    icon: Store,
    points: [
      "State that OFFA operates the marketplace and transaction services, while the purchase agreement is generally between the buyer and seller unless OFFA is specifically identified as the seller.",
      "Define when an order becomes binding, including payment authorization, seller acceptance if applicable, inventory availability, and OFFA review rights.",
      "Disclose the proposed buyer fee of 15 percent and seller fee of 11 percent, plus shipping, tax, payment, or other applicable charges before commitment.",
      "Explain payment processing through Stripe and authorize OFFA to hold, reverse, or refund transaction amounts when a transaction is cancelled, disputed, fraudulent, damaged, or materially not as described.",
      "Define the seller payout trigger, any inspection period, reserves or holds, chargebacks, negative balances, and the treatment of fees after a refund.",
      "Define when title and risk of loss transfer, and distinguish legal ownership transfer from delivery confirmation and the in-product Ownership Transfer status.",
      "Require sellers to provide accurate tax and payout information. Explain which taxes OFFA may collect and which obligations remain with the user.",
      "Set a dispute process, evidence requirements, response deadlines, and OFFA's authority to make marketplace remedies available under the policy.",
    ],
  },
  {
    id: "shipping",
    number: 3,
    title: "Shipping and Returns Policy",
    icon: Truck,
    points: [
      "Initial scope: U.S.-domestic transactions only, limited to eligible flat works and prints within defined size, weight, value, and material limits.",
      "Buyer pays shipping unless the listing or promotion expressly states otherwise.",
      "Seller packs the artwork according to OFFA standards and provides requested pre-shipment photographs. OFFA may generate or coordinate the shipping label through a selected shipping provider.",
      "Every shipment must use tracking and, above the selected threshold, signature confirmation and appropriate insurance.",
      "Define the seller's shipment deadline, buyer address-change restrictions, failed-delivery costs, storage, and abandonment handling.",
      "Use clear order states such as Paid, Preparing for Shipment, Shipped, Delivered, Under Review, Completed, Return Requested, Returned, Refunded, and Disputed.",
      "Require the buyer to inspect promptly and report non-delivery, damage, a materially inaccurate listing, or the wrong artwork within a defined period. Evidence should include photographs of the work, packaging, and shipping label.",
      "No return should be shipped without authorization. The policy must define who pays return shipping and whether original shipping and marketplace fees are refundable for each type of claim.",
      "Oversized works, sculpture, international shipping, and other complex categories should be excluded from the automated Closed Beta flow or handled manually.",
      "If local pickup is allowed, require an appointment, pickup code or signed receipt, condition acknowledgement, and a system-recorded handoff.",
    ],
  },
  {
    id: "seller-standards",
    number: 4,
    title: "Seller and Artwork Standards",
    icon: ShieldCheck,
    points: [
      "Sellers are invite-only for the initial launch and must complete identity, bank, and applicable tax verification.",
      "The seller must own the artwork or have documented authority to sell it, and must warrant that the work is authentic, not stolen, not counterfeit, and legally transferable.",
      "Required listing data should include artist, title, year, medium, dimensions, edition details, framed status, location, condition, price, images, and known provenance.",
      "Request available supporting materials such as invoice, certificate of authenticity, provenance records, front and back images, signature images, labels, and condition photographs.",
      "OFFA may manually review the seller and submitted materials, request additional evidence, reject or unpublish a listing, pause a sale, or hold payout.",
      "OFFA should not describe a work as OFFA Authenticated. Safer wording is Verified Seller and Seller provided documentation reviewed, with clear limits on what each label means.",
      "Define prohibited or restricted property, including stolen or illegally exported cultural property, counterfeit works, hazardous materials, and regulated wildlife materials.",
      "Require the seller to cooperate with shipping, authenticity, ownership, return, refund, and chargeback investigations after the sale.",
    ],
  },
  {
    id: "privacy",
    number: 5,
    title: "Privacy and Cookie Policy",
    icon: Lock,
    points: [
      "Describe account, identity, payment, tax, artwork, transaction, shipping, customer-support, device, analytics, cookie, and AI-conversation data that OFFA actually collects.",
      "Explain the purposes for collection and the parties that receive data, including Stripe, identity-verification providers, hosting and analytics vendors, shipping providers, and the counterparty to a transaction where necessary.",
      "State retention principles, security practices, user privacy rights, request and appeal channels where applicable, international data transfers, children's privacy, and policy-change procedures.",
      "Implement cookie disclosure and consent controls based on the analytics and advertising tools actually enabled in Production. The published policy must match the deployed tools.",
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">About OFFA</p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Policies &amp; Standards
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            How OFFA operates its Closed Beta marketplace: the terms that govern accounts and transactions, how
            artwork ships, what we expect from sellers, and how we handle your data.
          </p>

          <div className="mt-8 flex max-w-2xl gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Draft for Closed Beta.</span> These policies are an outline of what
              the final documents will cover and are subject to legal review. They are not yet binding terms.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Table of contents */}
          <aside className="mb-10 lg:mb-0">
            <nav className="lg:sticky lg:top-24" aria-label="Policy sections">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</h2>
              <ul className="mt-4 space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      className="flex gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="tabular-nums text-muted-foreground/60">{section.number}</span>
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      <span className="mr-2 text-muted-foreground">{section.number}.</span>
                      {section.title}
                    </h2>
                  </div>
                  <ul className="mt-6 space-y-4 border-l border-border pl-6">
                    {section.points.map((point) => (
                      <li key={point} className="relative text-pretty leading-relaxed text-muted-foreground">
                        <span className="absolute -left-[27px] top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
