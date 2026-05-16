/**
 * Onyx Digital — n8n Webhook Bridge
 * --------------------------------------------------------------
 * One file, one config. Every lead / order / payment flow on the
 * site posts to this single endpoint. Your n8n flow then routes
 * to Google Sheets, WhatsApp (Green API / Twilio), email, etc.
 *
 * 1) Set ONYX_WEBHOOK_URL below to your n8n production URL.
 *    Example: https://n8n.yourdomain.com/webhook/onyx-leads
 *
 * 2) Optional: set ONYX_WEBHOOK_TOKEN — sent as Bearer header so
 *    your n8n flow can verify the request originated from the site.
 *
 * 3) Leave URL blank ('') to disable the webhook entirely. The
 *    site will silently fall back to WhatsApp Click-to-Chat.
 * --------------------------------------------------------------
 */
window.ONYX_WEBHOOK_URL   = ''; // ← paste your n8n webhook URL here
window.ONYX_WEBHOOK_TOKEN = ''; // ← optional shared secret

/**
 * Post any payload to n8n. Returns a Promise<boolean> — true on
 * success, false on failure. Never throws; safe to fire-and-forget.
 *
 * @param {string} event   - 'lead' | 'order' | 'payment'
 * @param {object} payload - free-form data describing the event
 */
window.onyxWebhook = async function(event, payload){
  const url = window.ONYX_WEBHOOK_URL;
  if(!url) return false; // disabled — caller will fallback to WhatsApp

  const body = {
    event,
    site: 'onyxdigital',
    ts: new Date().toISOString(),
    page: location.pathname,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
    payload
  };

  const headers = { 'Content-Type': 'application/json' };
  if(window.ONYX_WEBHOOK_TOKEN){
    headers['Authorization'] = 'Bearer ' + window.ONYX_WEBHOOK_TOKEN;
  }

  try{
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive: true   // survives page navigation (e.g. payment.html → success)
    });
    return res.ok;
  } catch(err){
    console.warn('[onyx] webhook failed, falling back to WhatsApp:', err);
    return false;
  }
};
