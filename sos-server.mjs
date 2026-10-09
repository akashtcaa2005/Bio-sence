import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const app = express();
app.use(cors());
app.use(express.json());

// Email Transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akashtcaa.2005@gmail.com',
    pass: 'gfuz tdje vqad pfam'
  }
});

// Twilio Client setup
const twilioAccountSid = 'ACc7faddb7076aeefad5d733d15d165988';
const twilioAuthToken = '326c915c2e9805fef5d89bff2e63bdf0';
const twilioPhoneNumber = '+19786437111';
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

app.post('/send-sos', async (req, res) => {
  try {
    const { contacts, latitude, longitude, locationLabel, timestamp } = req.body;
    
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided' });
    }

    const mapsLink = latitude && longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : 'https://www.google.com/maps';

    let emailSuccessCount = 0;
    let smsSuccessCount = 0;
    const results = [];

    for (const contact of contacts) {
      const contactResult = { name: contact.name, email: null, sms: null };

      // --- 1. Send Email ---
      if (contact.email) {
        const mailOptions = {
          from: '"Bio Sense Emergency" <akashtcaa.2005@gmail.com>',
          to: contact.email,
          subject: '🚨 EMERGENCY ALERT — Patient Needs Immediate Help!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🚨 EMERGENCY ALERT</h1>
                <p style="color: #fca5a5; margin: 8px 0 0 0; font-size: 14px;">Bio Sense Health Monitoring System</p>
              </div>
              <div style="background: #fff7f7; padding: 24px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 4px;">Dear <strong>${contact.name}</strong>,</p>
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
                    <a href="${mapsLink}" style="color: #dc2626; font-size: 13px; font-weight: bold; text-decoration: none;">🗺 Open in Google Maps →</a>
                  </div>
                </div>
                <a href="${mapsLink}" style="display: block; background: #dc2626; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px;">
                  📍 View Location on Map
                </a>
              </div>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          contactResult.email = 'sent';
          emailSuccessCount++;
        } catch (err) {
          console.error(`Email failed for ${contact.email}:`, err);
          contactResult.email = `failed: ${err.message}`;
        }
      }

      // --- 2. Send SMS via Twilio ---
      if (contact.phone) {
        try {
          const smsMessage = `🚨 EMERGENCY ALERT 🚨\n\nPatient needs immediate help!\n\nLocation: ${mapsLink}\n\nPlease respond immediately!`;
          const toPhone = contact.phone.trim().startsWith('+') ? contact.phone.trim() : `+${contact.phone.replace(/\D/g, '')}`;

          await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: toPhone
          });

          contactResult.sms = 'sent';
          smsSuccessCount++;
        } catch (err) {
          console.error(`SMS failed for ${contact.phone}:`, err.message);
          contactResult.sms = `failed: ${err.message}`;
        }
      }

      results.push(contactResult);
    }

    res.json({ 
      success: true, 
      sent: Math.max(emailSuccessCount, smsSuccessCount), // For backwards-compatibility with frontend check
      emailSent: emailSuccessCount,
      smsSent: smsSuccessCount,
      results 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 8083;
app.listen(PORT, () => {
  console.log(`SOS Email & SMS (Fast2SMS) Server running on port ${PORT}`);
});
