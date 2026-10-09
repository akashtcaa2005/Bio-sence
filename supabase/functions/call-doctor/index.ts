const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return new Response(JSON.stringify({ error: 'Twilio credentials not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET → return TwiML to bridge caller to doctor's phone
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const doctorPhone = url.searchParams.get('doctorPhone') || '';
    const doctorName = url.searchParams.get('doctorName') || 'your doctor';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting you to ${doctorName}. Please wait.</Say>
  <Dial callerId="${TWILIO_PHONE_NUMBER}" timeout="30">${doctorPhone}</Dial>
  <Say voice="alice">The doctor is currently unavailable. Please try again later.</Say>
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // POST → initiate outbound call to user's phone, then bridge to doctor
  if (req.method === 'POST') {
    const { userPhone, doctorPhone, doctorName } = await req.json();

    if (!userPhone || !doctorPhone) {
      return new Response(JSON.stringify({ error: 'userPhone and doctorPhone are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build TwiML URL pointing back to this function's GET handler
    const projectRef = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const twimlUrl = `https://${projectRef}.supabase.co/functions/v1/call-doctor?doctorPhone=${encodeURIComponent(doctorPhone)}&doctorName=${encodeURIComponent(doctorName || '')}`;

    const formData = new URLSearchParams({
      To: userPhone,
      From: TWILIO_PHONE_NUMBER,
      Url: twimlUrl,
      StatusCallback: twimlUrl,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Failed to initiate call' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, callSid: data.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
});
