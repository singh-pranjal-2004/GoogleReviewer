# Google Reviewer

A web app to manage multiple Google Review pages with QR code sharing.

## Features

- **30-40+ Review Pages** — Each with custom review text, business name, and Google link
- **Admin Panel** — Add, edit, delete, enable/disable pages
- **QR Code Generator** — Generate & download QR codes for each page
- **Auto-Copy** — Review text is auto-copied to clipboard when page opens
- **Mobile Friendly** — Beautiful responsive design

## How It Works

1. Admin creates a review page with pre-written review text
2. QR code is generated for that page
3. When someone scans the QR code:
   - The review text is automatically copied to their clipboard
   - They can tap "Open Google Review" to paste and submit

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Admin Login

- **URL:** http://localhost:3000/admin
- **Default Credentials:** admin / admin123

## Deployment

Works great on Vercel:

```bash
npm install -g vercel
vercel
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- QR Code generation (qrcode library)
- JSON file-based storage (no database needed)
