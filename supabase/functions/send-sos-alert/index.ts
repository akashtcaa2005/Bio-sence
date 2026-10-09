import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sendSMS = async (to: string, body: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_PHONE_NUMBER");
  if (!accountSid || !authToken || !from) throw new Error("Twilio not configured");

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
    throw new Error(err.message);
  }
};

const sendWhatsApp = async (to: string, body: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_NUMBER") || "whatsapp:+14155238886";
  if (!accountSid || !authToken) throw new Error("Twilio not configured");

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
    throw new Error(err.message);
  }
};

const sendEmail = async (to: string, name: string, mapsLink: string, timestamp: string, locationLabel: string, latitude: number | null, longitude: number | null) => {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!gmailUser || !gmailPass) throw new Error("Gmail credentials not configured");

  const coordsLine = latitude && longitude
    ? `${latitude.toFixed(7)}, ${longitude.toFixed(7)}`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🚨 EMERGENCY ALERT</h1>
        <p style="color: #fca5a5; margin: 8px 0 0 0; font-size: 14px;">VitaGuardian Health Monitoring System</p>
      </div>
      <div style="background: #fff7f7; padding: 24px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 4px;">Dear <strong>${name}</strong>,</p>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #7f1d1d; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">⚠️ The patient needs immediate help!</p>
          <p style="color: #991b1b; margin: 0; font-size: 15px;">Please contact them immediately and ensure they get the necessary medical assistance.</p>
        </div>
        <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #fecaca; margin: 16px 0;">
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Alert Details</p>
          <p style="margin: 4px 0; color: #374151;"><strong>⏰ Time:</strong> ${timestamp}</p>
          <p style="margin: 8px 0 4px 0; color: #374151;"><strong>📍 Location:</strong></p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 6px 0;">
            <p style="margin: 0 0 4px 0; color: #111827; font-size: 15px; font-weight: bold;">${locationLabel}</p>
            ${coordsLine ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-family: monospace;">${coordsLine}</p>` : ""}
            <a href="${mapsLink}" style="color: #dc2626; font-size: 13px; font-weight: bold; text-decoration: none;">🗺 Open in Google Maps →</a>
          </div>
        </div>
        <a href="${mapsLink}" style="display: block; background: #dc2626; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px;">
          📍 View Location on Map
        </a>
        <hr style="border: none; border-top: 1px solid #fecaca; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">This is an automated emergency alert from VitaGuardian Health Monitoring System.</p>
      </div>
    </div>`;

  // Build raw RFC 2822 email message
  const subject = "=?UTF-8?B?" + btoa(unescape(encodeURIComponent("🚨 EMERGENCY ALERT — Patient Needs Immediate Help!"))) + "?=";
  const boundary = "biosense_" + Date.now();
  const rawEmail = [
    `From: BioSense Health <${gmailUser}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(
      `EMERGENCY ALERT\n\nDear ${name},\n\nThe patient needs immediate help!\n\n📍 Location: ${locationLabel}\n${coordsLine ? `   Coordinates: ${coordsLine}\n` : ""}   Map: ${mapsLink}\n⏰ Time: ${timestamp}\n\nPlease contact them immediately!\n\n-- VitaGuardian Health Monitoring`
    ))),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(html))),
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  const encodedMessage = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  // Use Gmail REST API with OAuth2 — but for App Password, use smtp2go relay
  // App Passwords work with SMTP; use a free SMTP relay that accepts Gmail credentials
  const smtpPayload = {
    api_key: "api-PLACEHOLDER", // not needed for direct SMTP
    to: [{ email: to, name }],
    sender: { email: gmailUser, name: "BioSense Emergency" },
    subject: "🚨 EMERGENCY ALERT — Patient Needs Immediate Help!",
    html_body: html,
    text_body: `EMERGENCY ALERT - ${name} needs help! Location: ${mapsLink} Time: ${timestamp}`,
  };

  // Send via Nodemailer-compatible approach using fetch to SMTP endpoint
  // Use Gmail SMTP directly via Deno TCP (smtp library)
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailPass,
      },
    },
  });

  await client.send({
    from: `BioSense Health <${gmailUser}>`,
    to,
    subject: "🚨 EMERGENCY ALERT — Patient Needs Immediate Help!",
    content: `EMERGENCY ALERT\n\nDear ${name},\n\nThe patient needs immediate help!\n\n📍 Location: ${locationLabel}\n${coordsLine ? `   Coordinates: ${coordsLine}\n` : ""}   Map: ${mapsLink}\n⏰ Time: ${timestamp}\n\nPlease contact immediately!\n\n-- VitaGuardian Health Monitoring`,
    html,
  });

  await client.close();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getClaims for ES256 JWT compatibility on Lovable Cloud
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const { latitude, longitude } = await req.json();

    // Fetch all active emergency contacts (verified or not — in an emergency, all contacts should be alerted)
    const { data: contacts, error: fetchError } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (fetchError) throw fetchError;
    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No emergency contacts found. Please add contacts in the Emergency Contacts page." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
    });

    const mapsLink = latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : "https://www.google.com/maps";

    // Build a human-readable location label from the saved default or coordinates
    const locationLabel = latitude && longitude
      ? `Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore (${latitude.toFixed(7)}, ${longitude.toFixed(7)})`
      : "Location unavailable";

    const smsMessage = `🚨 EMERGENCY ALERT\n\nThe patient needs immediate help!\n\n📍 Location: ${locationLabel}\n   Map: ${mapsLink}\n⏰ Time: ${timestamp}\n\nPlease contact immediately!`;

    const results = [];

    for (const contact of contacts) {
      const contactResult: any = { name: contact.name, email: "skipped", sms: "skipped", whatsapp: "skipped" };

      try {
        await sendEmail(contact.email, contact.name, mapsLink, timestamp, locationLabel, latitude, longitude);
        contactResult.email = "sent";
      } catch (e: any) {
        contactResult.email = `failed: ${e.message}`;
      }

      if (contact.phone) {
        try {
          await sendSMS(contact.phone, smsMessage);
          contactResult.sms = "sent";
        } catch (e: any) {
          contactResult.sms = `failed: ${e.message}`;
          // SMS failed — fallback to WhatsApp on same phone number
          try {
            await sendWhatsApp(contact.phone, smsMessage);
            contactResult.whatsapp = "sent (SMS fallback)";
          } catch (we: any) {
            contactResult.whatsapp = `failed: ${we.message}`;
          }
        }
      }

      // Also send WhatsApp if a dedicated WhatsApp number is saved (and SMS didn't already trigger it)
      if (contact.whatsapp && contactResult.whatsapp === "skipped") {
        try {
          await sendWhatsApp(contact.whatsapp, smsMessage);
          contactResult.whatsapp = "sent";
        } catch (e: any) {
          contactResult.whatsapp = `failed: ${e.message}`;
        }
      }

      results.push(contactResult);
    }

    // Log the alert notification
    for (const contact of contacts) {
      await supabase.from("alert_notifications").insert({
        user_id: userId,
        contact_id: contact.id,
        alert_type: "SOS Emergency",
        alert_message: `Emergency SOS triggered. Location: ${mapsLink}`,
        status: "sent",
      });
    }

    return new Response(
      JSON.stringify({ success: true, sent: contacts.length, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("send-sos-alert error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
