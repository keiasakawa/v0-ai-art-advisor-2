"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function placeBid({
  listing_id,
  amount,
  artwork_id,
}: {
  listing_id: number;
  amount: number;
  artwork_id: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch the listing to validate auction state
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listing_id)
    .single();

  if (listingError || !listing) {
    return { success: false, error: "Listing not found" };
  }

  if (listing.listing_type !== "auction") {
    return { success: false, error: "This listing is not an auction" };
  }

  if (listing.status !== "active") {
    return { success: false, error: "This auction is no longer active" };
  }

  if (listing.auction_end_date && new Date(listing.auction_end_date) < new Date()) {
    return { success: false, error: "This auction has already ended" };
  }

  // Prevent seller from bidding on their own listing
  if (listing.seller_id === user.id) {
    return { success: false, error: "You cannot bid on your own listing" };
  }

  // Get current highest bid
  const { data: highestBid } = await supabase
    .from("bids")
    .select("amount")
    .eq("listing_id", listing_id)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  const minimumBid = highestBid
    ? Number(highestBid.amount) + 1
    : Number(listing.auction_starting_bid ?? listing.price ?? 0);

  if (amount < minimumBid) {
    return {
      success: false,
      error: `Bid must be at least $${minimumBid.toFixed(2)}`,
    };
  }

  const { data, error } = await supabase
    .from("bids")
    .insert({
      listing_id,
      bidder_id: user.id,
      amount,
    })
    .select()
    .single();

  if (error) {
    console.error("[placeBid]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath(`/artwork/${artwork_id}`);

  return { success: true, data };
}

export async function getListingBids(listing_id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bids")
    .select("id, amount, created_at, bidder_id")
    .eq("listing_id", listing_id)
    .order("amount", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data ?? [] };
}
