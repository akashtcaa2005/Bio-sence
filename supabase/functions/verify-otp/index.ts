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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { contactId, otp } = await req.json();
    if (!contactId || !otp) {
      return new Response(JSON.stringify({ error: "contactId and otp required" }), { status: 400, headers: corsHeaders });
    }

    const { data: contact, error: fetchError } = await supabase
      .from("emergency_contacts")
      .select("otp_code, otp_expires_at, user_id")
      .eq("id", contactId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !contact) {
      return new Response(JSON.stringify({ error: "Contact not found" }), { status: 404, headers: corsHeaders });
    }

    if (!contact.otp_code) {
      return new Response(JSON.stringify({ error: "No OTP has been sent for this contact" }), { status: 400, headers: corsHeaders });
    }

    if (new Date() > new Date(contact.otp_expires_at!)) {
      return new Response(JSON.stringify({ error: "OTP has expired. Please request a new one." }), { status: 400, headers: corsHeaders });
    }

    if (contact.otp_code !== otp.trim()) {
      return new Response(JSON.stringify({ error: "Invalid OTP. Please try again." }), { status: 400, headers: corsHeaders });
    }

    // Mark as verified and clear OTP
    const { error: updateError } = await supabase
      .from("emergency_contacts")
      .update({ verified: true, otp_code: null, otp_expires_at: null })
      .eq("id", contactId);

    if (updateError) {
      throw new Error("Failed to update verification status");
    }

    return new Response(JSON.stringify({ success: true, message: "Contact verified successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
