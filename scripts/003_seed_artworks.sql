-- Seed mock artwork data
-- Run this after you have at least one user signed up
-- This script will associate all mock artworks with the first user found

DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Get an existing user
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, raise an error
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first, then run this script again.';
  END IF;

  -- Insert mock artworks for the demo user
  INSERT INTO public.artworks (user_id, title, artist, year, medium, dimensions, purchase_price, desired_price, provenance, certificate, condition, description, image_url, status, signed)
  VALUES
    (demo_user_id, 'Cosmic Drift', 'Elena Vasquez', '2023', 'Oil on Canvas', '48 × 36 in', 12000, 15000, 'Acquired directly from artist studio, New York', true, 'Excellent', 'A mesmerizing abstract piece featuring swirling cosmic colors and dynamic brushwork that evokes the vastness of space.', '/space-abstract-art.jpg', 'listed', true),
    
    (demo_user_id, 'Urban Fragments', 'Marcus Chen', '2022', 'Mixed Media on Panel', '36 × 48 in', 8500, 11000, 'Gallery acquisition, San Francisco', true, 'Excellent', 'Bold geometric forms intersect with organic shapes in this striking commentary on city life and human connection.', '/abstract-urban-painting.png', 'listed', true),
    
    (demo_user_id, 'Ethereal Landscape No. 7', 'Sofia Andersson', '2021', 'Acrylic on Canvas', '60 × 40 in', 18000, 22000, 'Private collection, Stockholm', true, 'Excellent', 'Part of the acclaimed Ethereal series, this piece captures the ephemeral beauty of Nordic light through layers of translucent color.', '/ethereal-landscape-painting.jpg', 'listed', true),
    
    (demo_user_id, 'Digital Dreams', 'Kai Nakamura', '2024', 'Digital Print on Aluminum', '40 × 40 in', 6500, 8500, 'Artist studio, Tokyo', true, 'Mint', 'A stunning fusion of traditional Japanese aesthetics with contemporary digital art techniques.', '/digital-art-colorful.jpg', 'listed', false),
    
    (demo_user_id, 'Geometric Harmony', 'Priya Sharma', '2023', 'Acrylic and Gold Leaf', '30 × 30 in', 9500, 12500, 'Gallery acquisition, Mumbai', true, 'Excellent', 'Intricate geometric patterns inspired by traditional Indian architecture, enhanced with 24k gold leaf accents.', '/geometric-abstract.png', 'listed', true),
    
    (demo_user_id, 'Contemporary Flow', 'James Morrison', '2022', 'Oil on Linen', '54 × 42 in', 14000, 17500, 'Estate sale, London', false, 'Very Good', 'Bold color fields and fluid forms create a sense of movement and emotional depth in this contemporary masterwork.', '/contemporary-abstract.jpg', 'listed', true),
    
    (demo_user_id, 'Organic Forms Study', 'Ana Lucia Ferreira', '2024', 'Latex and Mixed Media', 'Variable', 22000, 28000, 'Acquired from Biennale exhibition', true, 'Excellent', 'Sculptural wall piece exploring the boundaries between organic and synthetic materials.', '/abstract-latex-sculpture-hanging-organic-forms.jpg', 'listed', false),
    
    (demo_user_id, 'Industrial Memory', 'Heinrich Weber', '2021', 'Industrial Felt on Steel', '72 × 48 in', 32000, 40000, 'Museum deaccession, Berlin', true, 'Good', 'A powerful piece from Webers acclaimed Industrial Memory series, combining raw materials with minimalist aesthetics.', '/industrial-felt-art-installation-gray-minimalist.jpg', 'listed', true),
    
    (demo_user_id, 'Ancestral Bronze', 'Amara Okonkwo', '2023', 'Cast Bronze', '24 × 18 × 12 in', 45000, 55000, 'Direct from artist, Lagos', true, 'Mint', 'A stunning bronze sculpture celebrating African heritage and feminine strength.', '/bronze-sculpture-female-figure-african-art-contemp.jpg', 'listed', true),
    
    (demo_user_id, 'Woven Narratives', 'Carmen Delgado', '2022', 'Recycled Bottle Caps on Canvas', '48 × 72 in', 18000, 24000, 'Gallery acquisition, Mexico City', true, 'Excellent', 'An extraordinary tapestry created from thousands of recycled bottle caps, telling stories of community and sustainability.', '/metallic-tapestry-gold-silver-bottle-caps-woven-ar.jpg', 'listed', true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 10 mock artworks for user %', demo_user_id;
END $$;
