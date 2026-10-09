import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlertRequest {
  alertType: string;
  alertMessage: string;
  contacts?: { name: string; email: string }[];
  healthData?: {
    metric: string;
    value: string | number;
    normalRange: string;
  };
}

const sendEmail = async (to: string, subject: string, html: string) => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Bio Sense Alerts <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertType, alertMessage, contacts, healthData }: AlertRequest = await req.json();

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No contacts to notify", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = [];
    
    for (const contact of contacts) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Health Alert</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Dear ${contact.name},
            </p>
            <p style="color: #374151; font-size: 16px;">
            A health alert has been triggered. Please check on your family member:
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="color: #991b1b; font-weight: bold; margin: 0 0 10px 0;">${alertType}</p>
              <p style="color: #7f1d1d; margin: 0;">${alertMessage}</p>
            </div>
            ${healthData ? `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">Current Reading:</p>
              <p style="color: #111827; font-size: 24px; font-weight: bold; margin: 0;">${healthData.metric}: ${healthData.value}</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Normal range: ${healthData.normalRange}</p>
            </div>
            ` : ''}
            <p style="color: #374151; font-size: 14px; margin-top: 20px;">
              Please take appropriate action or contact the user directly.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated alert from Bio Sense Health Monitoring System.
            </p>
          </div>
        </div>
      `;

      try {
        const emailResponse = await sendEmail(
          contact.email,
          `🚨 Health Alert: ${alertType}`,
          emailHtml
        );

        results.push({ contact: contact.name, status: "sent", response: emailResponse });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${contact.email}:`, emailError);
        results.push({ contact: contact.name, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ message: "Alerts processed", results, sent: results.filter(r => r.status === "sent").length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-health-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
