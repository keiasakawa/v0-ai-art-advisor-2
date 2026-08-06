"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Called after a successful payment (fixed-price or auction winner).
 * Marks the listing as "sold", the artwork as "sold", and records the purchase.
 */
export async function markListingAsSold(
  artworkId: string,
  opts?: { stripeSessionId?: string; amountPaid?: number; purchaseType?: string },
) {
  const supabase = await createClient();

  // Fetch the listing so we can record its price and id
  const { data: listing } = await supabase
    .from("listings")
    .select("id, price, auction_starting_bid, listing_type")
    .eq("artwork_id", artworkId)
    .in("status", ["active", "ended"])
    .maybeSingle();

  const { error: listingError } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("artwork_id", artworkId)
    .in("status", ["active", "ended"]);

  if (listingError) {
    console.error("[markListingAsSold listing]", listingError.message);
    return { success: false, error: listingError.message };
  }

  const { error: artworkError } = await supabase
    .from("artworks")
    .update({ status: "sold", updated_at: new Date().toISOString() })
    .eq("id", artworkId);

  if (artworkError) {
    console.error("[markListingAsSold artwork]", artworkError.message);
    return { success: false, error: artworkError.message };
  }

  // Record the purchase for the buyer
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && listing) {
    const amountPaid =
      opts?.amountPaid ??
      (listing.listing_type === "auction"
        ? listing.auction_starting_bid
        : listing.price) ??
      0;

    await supabase.from("purchases").insert({
      buyer_id: user.id,
      artwork_id: artworkId,
      listing_id: listing.id,
      amount_paid: amountPaid,
      stripe_session_id: opts?.stripeSessionId ?? null,
      purchase_type: opts?.purchaseType ?? listing.listing_type ?? "fixed",
    });
  }

  revalidatePath(`/artwork/${artworkId}`);
  revalidatePath("/selling");
  revalidatePath("/browse");
  revalidatePath("/my-collection");
  return { success: true };
}

/**
 * Called when an auction expires with no bids.
 * Marks the listing as "ended" and the artwork back to "draft" so it can be relisted.
 */
export async function markAuctionNoSale(listingId: number, artworkId: string) {
  const supabase = await createClient();

  const { error: listingError } = await supabase
    .from("listings")
    .update({ status: "ended" })
    .eq("id", listingId)
    .eq("status", "active");

  if (listingError) {
    console.error("[markAuctionNoSale listing]", listingError.message);
    return { success: false, error: listingError.message };
  }

  const { error: artworkError } = await supabase
    .from("artworks")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", artworkId);

  if (artworkError) {
    console.error("[markAuctionNoSale artwork]", artworkError.message);
    return { success: false, error: artworkError.message };
  }

  revalidatePath(`/artwork/${artworkId}`);
  revalidatePath("/selling");
  return { success: true };
}

/**
 * Returns the current user's purchased artworks with artwork details.
 */
export async function getPurchases() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, data: [] };

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      id,
      amount_paid,
      purchase_type,
      created_at,
      artworks (
        id,
        title,
        artist,
        year,
        medium,
        image_url,
        image_urls
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPurchases]", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: data ?? [] };
}

/**
 * Returns the sold artworks for the current seller.
 */
export async function getSellerSales() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, data: [] };

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      id,
      amount_paid,
      purchase_type,
      created_at,
      artworks!inner (
        id,
        title,
        artist,
        image_url,
        user_id
      )
    `)
    .eq("artworks.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getSellerSales]", error.message);
    return { success: false, data: [] };
  }

  return { success: true, data: data ?? [] };
}

export async function takeDownListing(artworkId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Mark all active listings for this artwork as ended
  const { error: listingError } = await supabase
    .from("listings")
    .update({ status: "ended" })
    .eq("artwork_id", artworkId)
    .eq("seller_id", user.id)
    .eq("status", "active");

  if (listingError) {
    console.error("[takeDownListing]", listingError.message);
    return { success: false, error: listingError.message };
  }

  // Revert artwork status back to draft so it can be relisted
  const { error: artworkError } = await supabase
    .from("artworks")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", artworkId)
    .eq("user_id", user.id);

  if (artworkError) {
    console.error("[takeDownListing artwork]", artworkError.message);
    return { success: false, error: artworkError.message };
  }

  revalidatePath("/selling");
  return { success: true };
}

export async function createListing({
  artwork_id,
  price,
  listing_type = "fixed",
  auction_starting_bid,
  auction_end_date,
}: {
  artwork_id: string;
  price: number;
  listing_type?: "fixed" | "auction";
  auction_starting_bid?: number;
  auction_end_date?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      artwork_id,
      seller_id: user.id,
      price,
      listing_type,
      status: "active",
      ...(listing_type === "auction" && auction_starting_bid != null
        ? { auction_starting_bid }
        : {}),
      ...(listing_type === "auction" && auction_end_date
        ? { auction_end_date }
        : {}),
    })
    .select()
    .single();

  if (error) {
    console.error("[createListing]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/selling");

  return { success: true, data };
}
