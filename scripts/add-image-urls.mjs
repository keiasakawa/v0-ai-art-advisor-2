import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { error } = await supabase.rpc("exec_sql", {
  sql: `ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
        UPDATE public.artworks SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');`,
});

if (error) {
  // Try direct query approach
  const res = await supabase
    .from("artworks")
    .select("id, image_url")
    .not("image_url", "is", null);

  console.log("RPC not available, column may need to be added manually.");
  console.log("Run this SQL in Supabase dashboard:");
  console.log(
    "ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';"
  );
  console.log(
    "UPDATE public.artworks SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');"
  );
} else {
  console.log("Migration applied successfully.");
}
