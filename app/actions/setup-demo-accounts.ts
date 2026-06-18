"use server"

import { createClient } from "@supabase/supabase-js"

// Demo account configurations
const demoAccounts = [
  {
    email: "buyer@demo.offcanvas.art",
    password: "demobuyer123",
    name: "Demo Buyer",
    roles: ["collector_buyer"],
    activeRole: "collector_buyer",
  },
  {
    email: "seller@demo.offcanvas.art",
    password: "demoseller123",
    name: "Demo Seller",
    roles: ["collector_seller", "collector_buyer"],
    activeRole: "collector_seller",
  },
  {
    email: "curator@demo.offcanvas.art",
    password: "democurator123",
    name: "Demo Curator",
    roles: ["curator", "collector_buyer"],
    activeRole: "curator",
  },
]

export async function setupDemoAccounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      success: false,
      error: "Missing Supabase environment variables. SUPABASE_SERVICE_ROLE_KEY is required.",
    }
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const results: { email: string; success: boolean; error?: string }[] = []

  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u) => u.email === account.email)

      if (existingUser) {
        // Update existing user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password: account.password,
            email_confirm: true,
          }
        )

        if (updateError) {
          results.push({ email: account.email, success: false, error: updateError.message })
          continue
        }

        // Update profile using upsert with conflict handling
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              id: existingUser.id,
              name: account.name,
              roles: account.roles,
              active_role: account.activeRole,
            },
            { onConflict: "id" }
          )

        if (profileError) {
          results.push({ email: account.email, success: false, error: profileError.message })
          continue
        }

        results.push({ email: account.email, success: true })
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            name: account.name,
          },
        })

        if (createError) {
          results.push({ email: account.email, success: false, error: createError.message })
          continue
        }

        if (newUser?.user) {
          // Create profile using upsert to handle any existing profiles
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: newUser.user.id,
                name: account.name,
                roles: account.roles,
                active_role: account.activeRole,
              },
              { onConflict: "id" }
            )

          if (profileError) {
            results.push({ email: account.email, success: false, error: profileError.message })
            continue
          }
        }

        results.push({ email: account.email, success: true })
      }
    } catch (err) {
      results.push({
        email: account.email,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  const allSuccess = results.every((r) => r.success)
  return {
    success: allSuccess,
    results,
    error: allSuccess ? undefined : "Some accounts failed to create",
  }
}
