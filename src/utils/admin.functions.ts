import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Promote the current user to admin — but ONLY if no admin exists yet.
 * This is a safe one-time bootstrap so the very first user can claim admin.
 * After at least one admin exists, this becomes a no-op (returns claimed: false).
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };

    // Check if any admin already exists
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countErr) {
      return { claimed: false, reason: "lookup_failed", error: countErr.message };
    }

    if ((count ?? 0) > 0) {
      return { claimed: false, reason: "admin_exists" as const };
    }

    const { error: insertErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (insertErr) {
      return { claimed: false, reason: "insert_failed", error: insertErr.message };
    }

    return { claimed: true, reason: "promoted" as const };
  });

/**
 * Returns whether at least one admin exists in the system.
 * Used by the dashboard to show the "Claim admin" CTA only when relevant.
 */
export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) return { exists: true }; // fail closed — hide CTA
  return { exists: (count ?? 0) > 0 };
});