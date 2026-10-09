import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone, otp, redirectTo } = await req.json();
    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "phone and otp are required" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch latest unverified OTP for this phone
    const { data: record, error: fetchError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !record) {
      return new Response(JSON.stringify({ error: "No OTP found. Please request a new code." }), { status: 400, headers: corsHeaders });
    }

    if (new Date() > new Date(record.expires_at)) {
      return new Response(JSON.stringify({ error: "OTP has expired. Please request a new code." }), { status: 400, headers: corsHeaders });
    }

    if (record.otp_code !== otp.trim()) {
      return new Response(JSON.stringify({ error: "Invalid code. Please try again." }), { status: 400, headers: corsHeaders });
    }

    // Mark OTP as verified
    await supabase.from("phone_otps").update({ verified: true }).eq("id", record.id);

    // Derive a stable synthetic email from the phone number (strip all non-digits)
    const sanitizedPhone = phone.replace(/\D/g, "");
    const email = `${sanitizedPhone}@phone.biosense`;

    // Check if a user already exists for this phone
    const { data: phoneUser } = await supabase
      .from("phone_users")
      .select("user_id")
      .eq("phone", phone)
      .single();

    let userId: string;

    if (phoneUser) {
      userId = phoneUser.user_id;
      // Ensure email is confirmed on existing user
      await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
    } else {
      // Create new user with the synthetic email
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { phone },
      });

      if (createError || !newUser.user) {
        throw new Error("Failed to create user: " + (createError?.message || "Unknown error"));
      }

      userId = newUser.user.id;
      await supabase.from("phone_users").insert({ phone, user_id: userId });
    }

    // Generate a magic link for this user — client will navigate to action_link
    const callbackRedirect = redirectTo || req.headers.get("origin") || "";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: callbackRedirect },
    });

    if (linkError || !linkData) {
      throw new Error("Failed to generate sign-in link: " + linkError?.message);
    }

    return new Response(JSON.stringify({
      success: true,
      action_link: linkData.properties.action_link,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("verify-phone-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
