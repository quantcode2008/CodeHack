import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { DEMO_ACCOUNTS, type DemoRole } from "@/lib/auth/demo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const role = (body.role || "student") as DemoRole;

    if (!DEMO_ACCOUNTS[role]) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: student, owner, manager, admin.` },
        { status: 400 }
      );
    }

    const demo = DEMO_ACCOUNTS[role];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if real live Supabase keys are provided (not placeholder)
    const isLiveSupabase =
      supabaseUrl &&
      anonKey &&
      !supabaseUrl.includes("placeholder") &&
      !anonKey.includes("placeholder");

    if (isLiveSupabase) {
      const cookieStore = await cookies();
      const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in route handlers
            }
          },
        },
      });

      // Attempt sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      // If user does not exist yet and service role key is available, create user
      if (error && serviceRoleKey && !serviceRoleKey.includes("placeholder")) {
        const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        await adminClient.auth.admin.createUser({
          email: demo.email,
          password: demo.password,
          email_confirm: true,
          user_metadata: {
            full_name: demo.name,
            role: demo.role,
            affiliation: demo.affiliation,
          },
        });

        // Retry sign in
        const retry = await supabase.auth.signInWithPassword({
          email: demo.email,
          password: demo.password,
        });

        data = retry.data;
        error = retry.error;
      }

      if (!error && data?.session) {
        return NextResponse.json({
          success: true,
          mode: "live_supabase",
          user: data.user,
          profile: {
            id: data.user.id,
            email: demo.email,
            full_name: demo.name,
            role: demo.role,
            affiliation: demo.affiliation,
          },
        });
      }
    }

    // Graceful fallback for offline / self-serve evaluation without live Supabase credentials
    const response = NextResponse.json({
      success: true,
      mode: "local_simulation",
      user: {
        id: demo.id,
        email: demo.email,
        aud: "authenticated",
        role: "authenticated",
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {
          full_name: demo.name,
          role: demo.role,
          affiliation: demo.affiliation,
        },
      },
      profile: {
        id: demo.id,
        email: demo.email,
        full_name: demo.name,
        role: demo.role,
        affiliation: demo.affiliation,
        verified_status: "verified",
      },
    });

    // Set demo persona cookie
    response.cookies.set("commons_demo_role", role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process demo login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
