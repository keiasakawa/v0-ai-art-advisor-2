"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
