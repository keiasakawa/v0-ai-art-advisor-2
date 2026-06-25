import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getArtworkWithListing } from "@/app/actions/artwork";
import ArtworkDetailClient from "./artwork-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getArtworkWithListing(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const {
    artwork,
    listing,
    highestBid,
    bidCount,
    isAuctionEnded,
    currentUserId,
    currentUserIsWinner,
  } = result.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <ArtworkDetailClient
        artwork={artwork}
        listing={listing}
        highestBid={highestBid}
        bidCount={bidCount}
        isAuctionEnded={isAuctionEnded}
        currentUserId={currentUserId}
        currentUserIsWinner={currentUserIsWinner}
      />
    </div>
  );
}
