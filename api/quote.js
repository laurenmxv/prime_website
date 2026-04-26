/**
 * /api/quote — Vercel Function for the contact-form backend.
 *
 * Accepts a POST from /contact/, validates, and sends two emails via Resend:
 *  1. Owner notification → QUOTE_TO_EMAIL
 *  2. User confirmation → form's email field
 *
 * Required env vars (set in Vercel Project Settings → Environment Variables):
 *  - RESEND_API_KEY       (https://resend.com)
 *  - QUOTE_TO_EMAIL       (where leads go, e.g. info@primeoutdoorexperts.com)
 *  - QUOTE_FROM_EMAIL     (verified sender, e.g. quotes@primeoutdoorexperts.com)
 *
 * Spam protection: honeypot field `_gotcha` (must be empty).
 */

const ALLOWED_ORIGINS = [
  'https://primeoutdoorexperts.com',
  'https://www.primeoutdoorexperts.com',
];

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Vercel parses application/x-www-form-urlencoded and application/json into req.body
  const body = req.body || {};
  const {
    name = '',
    email = '',
    phone = '',
    property_type = '',
    address = '',
    message = '',
    _gotcha = '',
  } = body;

  // Honeypot — silently accept and drop bot submissions
  if (_gotcha && _gotcha.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  // Validation
  const errors = [];
  if (!name.trim()) errors.push('Name is required.');
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required.');
  if (!phone.trim()) errors.push('Phone is required.');
  if (!message.trim()) errors.push('Tell us about your property.');
  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors.join(' ') });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.QUOTE_TO_EMAIL || 'info@primeoutdoorexperts.com';
  const FROM = process.env.QUOTE_FROM_EMAIL || 'quotes@primeoutdoorexperts.com';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY missing');
    return res.status(500).json({ ok: false, error: 'Server is not configured to send mail.' });
  }

  // ---- Owner notification email ----
  const ownerSubject = `New quote request — ${name} (${property_type || 'Unknown property'})`;
  const ownerHtml = `
    <h2 style="font-family:Inter,sans-serif;color:#1D3A2B;">New quote request</h2>
    <table style="font-family:Inter,sans-serif;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 12px 6px 0;color:#6B8B7A;">Name</td><td><strong>${escapeHtml(name)}</strong></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6B8B7A;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6B8B7A;">Phone</td><td><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6B8B7A;">Property type</td><td>${escapeHtml(property_type) || '—'}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6B8B7A;">Address</td><td>${escapeHtml(address) || '—'}</td></tr>
    </table>
    <h3 style="font-family:Inter,sans-serif;color:#1D3A2B;margin-top:24px;">Message</h3>
    <p style="font-family:Inter,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
    <hr style="border:none;border-top:1px solid #D9D2C0;margin:24px 0;">
    <p style="font-family:Inter,sans-serif;font-size:12px;color:#7A867D;">
      Submitted via primeoutdoorexperts.com/contact/<br>
      ${new Date().toISOString()}
    </p>
  `.trim();

  // ---- User confirmation email ----
  const userSubject = `We got your request — Prime Outdoor Experts`;
  const userHtml = `
    <div style="font-family:Inter,sans-serif;color:#1D3A2B;max-width:560px;">
      <h2 style="font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 16px;">Thanks, ${escapeHtml(name.split(' ')[0])}.</h2>
      <p style="font-size:15px;line-height:1.6;">We received your quote request and will get back to you within 2 business hours.</p>
      <p style="font-size:15px;line-height:1.6;">If anything is urgent, call <a href="tel:+14074434505" style="color:#3F7556;font-weight:600;">(407) 443-4505</a>.</p>
      <p style="font-size:14px;line-height:1.6;color:#4A5849;margin-top:24px;">— Prime Outdoor Experts<br>Lake Mary, FL</p>
    </div>
  `.trim();

  // Send both emails
  try {
    const sendOne = async ({ to, subject, html, replyTo }) => {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Prime Outdoor Experts <${FROM}>`,
          to: [to],
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Resend ${r.status}: ${text}`);
      }
      return r.json();
    };

    await sendOne({
      to: TO,
      subject: ownerSubject,
      html: ownerHtml,
      replyTo: email,
    });

    // User confirmation — best-effort; don't fail the whole request if it bounces
    try {
      await sendOne({
        to: email,
        subject: userSubject,
        html: userHtml,
      });
    } catch (e) {
      console.warn('User confirmation failed (non-fatal):', e.message);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Quote send failed:', err);
    return res.status(500).json({
      ok: false,
      error: 'Could not send your request. Please call (407) 443-4505 or try again.',
    });
  }
}
