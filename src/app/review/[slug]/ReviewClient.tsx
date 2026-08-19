'use client'

import { useState, useEffect } from 'react'

interface PageData {
  id: string
  slug: string
  businessName: string
  reviewText: string
  googleReviewLink: string
  active: boolean
}

export default function ReviewClient({ page }: { page: PageData }) {
  const [status, setStatus] = useState('')
  const [statusColor, setStatusColor] = useState('#0d9488')
  const [reviewText, setReviewText] = useState(page.reviewText)
  const [autoCopied, setAutoCopied] = useState(false)

  // Auto-copy on page load
  useEffect(() => {
    async function autoCopy() {
      try {
        await navigator.clipboard.writeText(page.reviewText)
        setAutoCopied(true)
        setStatusColor('#0d9488')
        setStatus('✓ Review auto-copied! Tap "Open Google Review" to paste it.')
      } catch {
        // Clipboard API failed (needs user gesture), will copy on button click
      }
    }
    autoCopy()
  }, [page.reviewText])

  async function handleCopy() {
    const text = reviewText.trim()
    if (!text) {
      setStatusColor('#d93025')
      setStatus('Please enter your review first.')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback
      const textarea = document.getElementById('review') as HTMLTextAreaElement
      textarea?.select()
      document.execCommand('copy')
    }
    setStatusColor('#0d9488')
    setStatus("✓ Copied — Tap 'Open Google Review' and paste your review.")
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{
          background:linear-gradient(145deg,#f0f4f9 0%,#e8eef6 100%);
          font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
          color:#1f2937;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:16px;
          -webkit-font-smoothing:antialiased
        }
        .card{
          width:100%;
          max-width:440px;
          background:#fff;
          border-radius:28px;
          padding:28px 26px 18px;
          text-align:center;
          box-shadow:0 20px 40px -15px rgba(0,0,0,.08), 0 0 1px 1px rgba(0,0,0,.04);
          position:relative;
          overflow:hidden
        }
        .card::before{
          content:'';
          position:absolute;
          top:0;left:0;right:0;
          height:5px;
          background:linear-gradient(90deg,#F4B400,#4285f4,#0F9D58)
        }
        .business-name{
          font-size:20px;font-weight:800;color:#111827;letter-spacing:-.3px;margin-bottom:6px
        }
        .stars{
          font-size:28px;color:#fbbf24;letter-spacing:4px;margin-bottom:12px;display:inline-block;
          filter:drop-shadow(0 2px 4px rgba(251,191,36,.3))
        }
        h1{font-size:24px;font-weight:700;color:#1f2937;letter-spacing:-.5px;margin-bottom:7px}
        .sub{color:#6b7280;font-size:14px;line-height:1.45;margin-bottom:17px;padding:0 6px}
        .review{
          width:100%;min-height:175px;background:#f8fafc;border:1.5px solid #e2e8f0;
          border-radius:16px;padding:15px;text-align:left;font-family:inherit;font-size:14.5px;
          line-height:1.55;color:#334155;outline:none;resize:vertical;
          transition:all .2s ease;box-shadow:inset 0 2px 4px rgba(0,0,0,.02)
        }
        .review:focus{border-color:#4285f4;background:#fff;box-shadow:0 0 0 4px rgba(66,133,244,.12)}
        .button-group{display:flex;flex-direction:column;gap:9px;margin-top:14px}
        button,.open-btn{
          width:100%;border:0;border-radius:14px;padding:13px 20px;font-size:15px;font-weight:700;
          font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
          text-decoration:none;transition:transform .15s ease, box-shadow .2s ease, background-color .2s ease
        }
        button:active,.open-btn:active{transform:scale(.98)}
        .copy{background:#111827;color:#fff;box-shadow:0 4px 12px rgba(17,24,39,.15)}
        .copy:hover{background:#1f2937;box-shadow:0 6px 16px rgba(17,24,39,.25)}
        .open-btn{background:#1a73e8;color:#fff;box-shadow:0 4px 12px rgba(26,115,232,.25)}
        .open-btn:hover{background:#1557b0;box-shadow:0 6px 16px rgba(26,115,232,.35)}
        .status{min-height:18px;margin:9px 0 0;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center}
        .note{font-size:11.5px;color:#94a3b8;line-height:1.45;margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9}
        .auto-badge{
          background:#ecfdf5;color:#059669;font-size:11px;font-weight:600;
          padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:10px
        }
        @media(max-width:480px){
          body{padding:12px}
          .card{padding:25px 20px 14px;border-radius:24px}
          .business-name{font-size:18px}
          .stars{font-size:26px;margin-bottom:10px}
          h1{font-size:22px}
          .sub{font-size:13px;margin-bottom:15px}
          .review{min-height:165px;font-size:14px;padding:14px}
          .button-group{margin-top:12px}
          button,.open-btn{padding:12px 18px}
          .note{margin-top:8px;padding-top:8px}
        }
      `}</style>
      <div className="card">
        <div className="business-name">{page.businessName}</div>
        <div className="stars">★★★★★</div>
        {autoCopied && <div className="auto-badge">✓ Review copied to clipboard</div>}
        <h1>Share Your Experience</h1>
        <p className="sub">
          Copy, edit if needed to match your experience, and paste it into Google Reviews.
        </p>
        <textarea
          className="review"
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div className="button-group">
          <button className="copy" onClick={handleCopy}>
            Copy Review
          </button>
          <a
            className="open-btn"
            href={page.googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Google Review
          </a>
        </div>
        <div className="status" style={{ color: statusColor }}>
          {status}
        </div>
        <div className="note">
          We&apos;d love to hear your true thoughts! Feel free to add your own personal touch
          before sharing it on Google. ✨
        </div>
      </div>
    </>
  )
}
