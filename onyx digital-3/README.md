# Onyx Digital — Self-Host Bundle

Premium Hebrew (RTL) marketing site + order flow for Onyx Digital.

This is the exact code from the Claude design preview — pure HTML / CSS / JS,
no build step, no framework. Drop the folder on any static host (Vercel,
Netlify, Cloudflare Pages, GitHub Pages, plain Apache / nginx) and you're live.

---

## 📂 What's inside

| File | Purpose |
|---|---|
| `index.html` | Main landing page (hero, services, work, pricing, FAQ, contact lead form) |
| `order.html` | Plan selection + customer details form |
| `payment.html` | Payment method selection (card / Bit / PayBox / bank transfer) + coupon |
| `mobile-app.html` | iOS app mockup (the dashboard demo linked from the homepage) |
| `accessibility-statement.html` | Israeli accessibility regulation page (legally required) |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `webhook.js` | **n8n integration — set your URL here, all forms post to it** |
| `logo.svg` | Onyx mark |
| `PAYMENT-INTEGRATION-GUIDE.md` | How to plug Cardcom / Tranzila / Meshulam for real card processing |

All styles and component code are inlined inside each HTML file. There is
intentionally no shared CSS file — each page is self-contained.

---

## 🚀 Hosting

### Option A — Vercel / Netlify / Cloudflare Pages (easiest)

1. Create a new project, point it at this folder (drag-and-drop or git push).
2. Framework preset: **None / Static**.
3. Build command: *(leave empty)*. Output directory: `.` (root).
4. Deploy. Done.

### Option B — GitHub Pages

1. Push the folder to a repo.
2. Settings → Pages → Source: `main` branch, root.
3. Your site is at `https://<user>.github.io/<repo>/`.

### Option C — Your own server

Just serve the folder as static files. Any web server works:

```bash
# nginx (snippet inside server block)
root /var/www/onyx;
index index.html;
try_files $uri $uri/ =404;

# or just for testing locally:
python3 -m http.server 8080
```

---

## 🔌 Connecting your n8n webhook

This is the only file you need to edit:

**`webhook.js`** — open it, paste your n8n production webhook URL:

```js
window.ONYX_WEBHOOK_URL   = 'https://n8n.yourdomain.com/webhook/onyx-leads';
window.ONYX_WEBHOOK_TOKEN = ''; // optional shared secret
```

That's it. Every form on the site (lead modal, order start, payment) now POSTs
to that URL. Leave `ONYX_WEBHOOK_URL = ''` and the site silently falls back to
WhatsApp Click-to-Chat — no errors, no broken UX.

### Events your n8n flow will receive

All requests are `POST` with `Content-Type: application/json`. Body shape:

```json
{
  "event": "lead" | "order_started" | "payment",
  "site": "onyxdigital",
  "ts": "2026-05-02T14:30:00.000Z",
  "page": "/index.html",
  "referrer": "https://google.com/...",
  "userAgent": "...",
  "payload": { ... }
}
```

#### `event: "lead"` — contact form on landing page
```json
{
  "topic": "consult" | "general" | "pricing" | "support",
  "topicLabel": "ייעוץ ראשוני",
  "name": "ישראל ישראלי",
  "phone": "0501234567",
  "biz": "מסעדה תל אביבית",
  "msg": "..."
}
```

#### `event: "order_started"` — user clicked "המשך לתשלום" on order.html
```json
{
  "planTier": "Premium",
  "planName": "אתר Premium",
  "price": 8990,
  "fullName": "...",
  "phone": "...",
  "email": "...",
  "bizName": "...",
  "bizType": "...",
  "notes": "..."
}
```

#### `event: "payment"` — user completed payment on payment.html
```json
{
  "planTier": "Premium",
  "fullName": "...",
  "phone": "...",
  "email": "...",
  "bizName": "...",
  "method": "card" | "bit" | "paybox" | "transfer",
  "finalAmount": 8990,
  "coupon": "WELCOME10" | null,
  "discountPct": 10
}
```

### Suggested n8n flow

```
Webhook (POST)
  ↓
Switch on {{$json.event}}
  ├── "lead"           → Google Sheet "Leads"          → WhatsApp message to owner (Green API)
  ├── "order_started"  → Google Sheet "Pending Orders" → Telegram alert
  └── "payment"        → Google Sheet "Paid Orders"    → WhatsApp + customer email (SendGrid / Gmail)
```

### Optional: shared-secret verification

If you set `ONYX_WEBHOOK_TOKEN`, every request includes:
`Authorization: Bearer <your token>`

Add an IF node at the top of your n8n flow:
```
{{ $headers.authorization }}  equals  Bearer your-secret-here
```

---

## 💳 Real card processing

`payment.html` currently shows a success modal after a fake card submit.
For real money, you need to integrate an Israeli PSP. Read
**`PAYMENT-INTEGRATION-GUIDE.md`** for step-by-step Cardcom / Tranzila / Meshulam
hookup instructions. The change is ~10 lines in `payment.html`.

---

## ✏️ Customizing

### Phone / email / business name
Search-and-replace these strings across the project:
- `0506782329` and `972506782329` (phone)
- `omerdd04@gmail.com` (email)
- `Onyx Digital` (brand name)

### Colors
The luxury palette is defined as CSS variables at the top of each file's
`<style>` block. Look for:
```css
:root{
  --gold: #c7ae6a;
  --gold-deep: #a08a4d;
  --gold-tint: #faf6ec;
  --text: #1d1d1f;
  /* ... */
}
```
Change `--gold` and the gold tones cascade everywhere.

### Fonts
Self-hosted Google Fonts via `<link>` in each `<head>`:
- Hebrew body: **Heebo**
- Latin display: **Cormorant Garamond** (serif accents)
- UI / numbers: **Inter**

---

## 🛠 Local dev

No build step. Edit any `.html` file and refresh. Use any static server for
proper RTL/CORS testing:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## 📜 Licensing

Code is yours. Fonts are licensed under the SIL Open Font License via Google
Fonts CDN. Replace the placeholder logo (`logo.svg`) with your own before
going live.

---

## Questions?

Anything about a specific component, flow, or hookup — open the file, the code
is heavily commented in plain English (and Hebrew for user-facing strings).
