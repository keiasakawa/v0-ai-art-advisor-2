-- Allow buying an artwork that is "listed" but has no listings row (e.g. the
-- seeded artworks). Checkout already prices these from artworks.desired_price,
-- so the sale must be recordable too, with purchases.listing_id left NULL.
-- Also locks the artwork row so the same artwork cannot be sold twice.
CREATE OR REPLACE FUNCTION public.mark_listing_sold(
  p_artwork_id uuid,
  p_stripe_session_id text DEFAULT NULL::text,
  p_amount_paid numeric DEFAULT NULL::numeric,
  p_purchase_type text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_buyer_id uuid := auth.uid();
  v_artwork record;
  v_listing record;
  v_amount numeric;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, status, desired_price, purchase_price
    INTO v_artwork
  FROM public.artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  IF v_artwork.id IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;

  IF v_artwork.status = 'sold' THEN
    RAISE EXCEPTION 'This artwork has already been sold';
  END IF;

  SELECT id, price, auction_starting_bid, listing_type
    INTO v_listing
  FROM public.listings
  WHERE artwork_id = p_artwork_id
    AND status IN ('active', 'ended')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_listing.id IS NULL AND v_artwork.status IS DISTINCT FROM 'listed' THEN
    RAISE EXCEPTION 'No purchasable listing found for this artwork';
  END IF;

  IF v_listing.id IS NOT NULL THEN
    UPDATE public.listings SET status = 'sold' WHERE id = v_listing.id;
  END IF;
  UPDATE public.artworks SET status = 'sold', updated_at = now() WHERE id = p_artwork_id;

  v_amount := COALESCE(
    p_amount_paid,
    CASE WHEN v_listing.listing_type = 'auction' THEN v_listing.auction_starting_bid ELSE NULLIF(v_listing.price, 0) END,
    NULLIF(v_artwork.desired_price, 0),
    v_artwork.purchase_price,
    0
  );

  INSERT INTO public.purchases (buyer_id, artwork_id, listing_id, amount_paid, stripe_session_id, purchase_type)
  VALUES (v_buyer_id, p_artwork_id, v_listing.id, v_amount, p_stripe_session_id, COALESCE(p_purchase_type, v_listing.listing_type, 'fixed'));

  RETURN json_build_object('success', true, 'listing_id', v_listing.id, 'amount_paid', v_amount);
END;
$function$;
