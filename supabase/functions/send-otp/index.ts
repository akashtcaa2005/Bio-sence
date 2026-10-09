import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendSMS = async (to: string, body: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_PHONE_NUMBER");
  if (!accountSid || !authToken || !from) throw new Error("Twilio credentials not configured");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Twilio SMS error: ${err.message}`);
  }
  return await response.json();
};

const sendWhatsApp = async (to: string, body: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_NUMBER") || "whatsapp:+14155238886";
  if (!accountSid || !authToken) throw new Error("Twilio credentials not configured");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        Body: body,
      }).toString(),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Twilio WhatsApp error: ${err.message}`);
  }
  return await response.json();
};

const sendEmail = async (to: string, name: string, otp: string) => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🏥 BioSense Health — Contact Verification</h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="color: #374151; font-size: 16px;">Hello ${name},</p>
        <p style="color: #374151;">You've been added as an emergency contact. Please verify your identity using the OTP below:</p>
        <div style="background: white; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Your verification code</p>
          <p style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #0284c7; margin: 0;">${otp}</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">Valid for 10 minutes</p>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not expect this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">BioSense Health Monitoring System</p>
      </div>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BioSense Health <onboarding@resend.dev>",
      to: [to],
      subject: `Your BioSense Verification Code: ${otp}`,
      html,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend error: ${err}`);
  }
  return await response.json();
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

    const { contactId } = await req.json();
    if (!contactId) {
      return new Response(JSON.stringify({ error: "contactId required" }), { status: 400, headers: corsHeaders });
    }

    const { data: contact, error: fetchError } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("id", contactId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !contact) {
      return new Response(JSON.stringify({ error: "Contact not found" }), { status: 404, headers: corsHeaders });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const message = `Your BioSense emergency contact verification code is: ${otp}. Valid for 10 minutes.`;

    // Update OTP in DB
    await supabase
      .from("emergency_contacts")
      .update({ otp_code: otp, otp_expires_at: expiresAt, verification_sent_at: new Date().toISOString() })
      .eq("id", contactId);

    const results: Record<string, string> = {};

    // Send SMS if phone provided
    if (contact.phone) {
      try {
        await sendSMS(contact.phone, message);
        results.sms = "sent";
      } catch (e: any) {
        console.error("SMS error:", e.message);
        results.sms = `failed: ${e.message}`;
      }
    }

    // Send WhatsApp if whatsapp provided
    if (contact.whatsapp) {
      try {
        await sendWhatsApp(contact.whatsapp, `🏥 BioSense Verification\n\n${message}`);
        results.whatsapp = "sent";
      } catch (e: any) {
        console.error("WhatsApp error:", e.message);
        results.whatsapp = `failed: ${e.message}`;
      }
    }

    // Send Email
    try {
      await sendEmail(contact.email, contact.name, otp);
      results.email = "sent";
    } catch (e: any) {
      console.error("Email error:", e.message);
      results.email = `failed: ${e.message}`;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
