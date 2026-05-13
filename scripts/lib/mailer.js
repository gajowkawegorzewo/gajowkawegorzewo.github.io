const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (e) {}

/**
 * Mailer helper using Resend API
 */
async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[MAIL] Brak RESEND_API_KEY — raport nie zostanie wysłany.');
    return { ok: false, error: 'no_api_key' };
  }

  const from = process.env.EMAIL_FROM || 'Gajowka Blog <onboarding@resend.dev>';
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html, text })
    });
    
    if (res.ok) {
      console.log(`[MAIL] Raport wysłany do ${to}`);
      return { ok: true };
    } else {
      const err = await res.text();
      console.error(`[MAIL] Błąd Resend: ${err}`);
      return { ok: false, error: err };
    }
  } catch (e) {
    console.error(`[MAIL] Błąd krytyczny: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };
