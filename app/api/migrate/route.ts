import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// One-shot migration endpoint — call once to add image_urls column
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Use Supabase's pg connection via postgrest schema introspection
  // We'll do it by calling a stored procedure or raw via the pg connection string
  // Since we can't run arbitrary DDL via REST, we fall back to checking if the column exists
  // and inserting a placeholder row as a proxy. Instead we use the DB url approach.

  const dbUrl = process.env.POSTGRES_URL_NON_POOLING;
  if (!dbUrl) {
    return NextResponse.json({ error: "No database URL" }, { status: 500 });
  }

  try {
    // Dynamic import since pg may not be bundled
    const { default: pkg } = await import("pg");
    const { Client } = pkg;
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(`ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'`);
    await client.query(`UPDATE public.artworks SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}')`);
    await client.end();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
