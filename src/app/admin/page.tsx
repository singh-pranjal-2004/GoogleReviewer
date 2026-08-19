'use client'

import { useState, useEffect } from 'react'

interface PageData {
  _id: string
  slug: string
  businessName: string
  reviewText: string
  googleReviewLink: string
  active: boolean
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [pages, setPages] = useState<PageData[]>([])
  const [editingPage, setEditingPage] = useState<PageData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') setIsLoggedIn(true)
    setBaseUrl(window.location.origin)
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchPages()
  }, [isLoggedIn])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsLoggedIn(true)
    } else {
      setLoginError('Invalid credentials. Default: admin / admin123')
    }
  }

  async function fetchPages() {
    const res = await fetch('/api/pages')
    const data = await res.json()
    setPages(data)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPage) return

    const method = editingPage._id ? 'PUT' : 'POST'
    await fetch('/api/pages', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPage),
    })

    setEditingPage(null)
    setShowForm(false)
    fetchPages()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return
    await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
    fetchPages()
  }

  async function generateQR(slug: string) {
    const url = `${baseUrl}/review/${slug}`
    const res = await fetch(`/api/qrcode?url=${encodeURIComponent(url)}`)
    const data = await res.json()
    setQrCodes((prev) => ({ ...prev, [slug]: data.qrCode }))
  }

  function startNew() {
    setEditingPage({
      _id: '',
      slug: '',
      businessName: 'Moti Scrap Dealer',
      reviewText: '',
      googleReviewLink: 'https://g.page/r/CSVCAOgPY403EBM/review',
      active: true,
    })
    setShowForm(true)
  }

  function startEdit(page: PageData) {
    setEditingPage({ ...page })
    setShowForm(true)
  }

  if (!isLoggedIn) {
    return (
      <>
        <style>{adminStyles}</style>
        <div className="login-container">
          <div className="login-card">
            <h1>🔐 Admin Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {loginError && <p className="error">{loginError}</p>}
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-container">
        <header className="admin-header">
          <h1>📋 Review Pages Manager</h1>
          <div className="header-actions">
            <span className="page-count">{pages.length} pages</span>
            <button className="btn-new" onClick={startNew}>
              + New Page
            </button>
            <button
              className="btn-logout"
              onClick={() => {
                sessionStorage.removeItem('admin_auth')
                setIsLoggedIn(false)
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {showForm && editingPage && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingPage._id ? 'Edit Page' : 'New Page'}</h2>
              <form onSubmit={handleSave}>
                <label>
                  Business Name
                  <input
                    type="text"
                    value={editingPage.businessName}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, businessName: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Slug (URL path)
                  <input
                    type="text"
                    value={editingPage.slug}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, slug: e.target.value })
                    }
                    placeholder="auto-generated if empty"
                  />
                </label>
                <label>
                  Review Text
                  <textarea
                    value={editingPage.reviewText}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, reviewText: e.target.value })
                    }
                    rows={6}
                    required
                  />
                </label>
                <label>
                  Google Review Link
                  <input
                    type="url"
                    value={editingPage.googleReviewLink}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, googleReviewLink: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingPage.active}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    Save
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="pages-grid">
          {pages.map((page) => (
            <div key={page._id} className={`page-card ${!page.active ? 'inactive' : ''}`}>
              <div className="page-card-header">
                <h3>{page.businessName}</h3>
                <span className={`badge ${page.active ? 'active' : 'inactive'}`}>
                  {page.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="slug">/review/{page.slug}</p>
              <p className="review-preview">{page.reviewText.substring(0, 100)}...</p>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => startEdit(page)}>
                  ✏️ Edit
                </button>
                <button className="btn-qr" onClick={() => generateQR(page.slug)}>
                  📱 QR
                </button>
                <button className="btn-preview" onClick={() => window.open(`/review/${page.slug}`, '_blank')}>
                  👁️ View
                </button>
                <button className="btn-delete" onClick={() => handleDelete(page._id)}>
                  🗑️
                </button>
              </div>
              {qrCodes[page.slug] && (
                <div className="qr-container">
                  <img src={qrCodes[page.slug]} alt="QR Code" />
                  <p className="qr-url">{baseUrl}/review/{page.slug}</p>
                  <a href={qrCodes[page.slug]} download={`qr-${page.slug}.png`} className="btn-download">
                    ⬇️ Download QR
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const adminStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f0f4f9;
    min-height: 100vh;
    color: #1f2937;
  }
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .login-card {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    text-align: center;
  }
  .login-card h1 { margin-bottom: 24px; font-size: 24px; }
  .login-card input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    font-family: inherit;
    margin-bottom: 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .login-card input:focus { border-color: #4285f4; }
  .login-card button {
    width: 100%;
    padding: 13px;
    background: #111827;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    margin-top: 8px;
  }
  .login-card button:hover { background: #1f2937; }
  .error { color: #d93025; font-size: 13px; margin-bottom: 8px; }

  .admin-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .admin-header h1 { font-size: 22px; }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .page-count {
    background: #e8eef6;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  .btn-new {
    background: #1a73e8;
    color: #fff;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    font-size: 14px;
  }
  .btn-new:hover { background: #1557b0; }
  .btn-logout {
    background: #fee2e2;
    color: #991b1b;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    font-size: 14px;
  }

  .pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
  .page-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: transform 0.15s;
  }
  .page-card:hover { transform: translateY(-2px); }
  .page-card.inactive { opacity: 0.6; }
  .page-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .page-card-header h3 { font-size: 16px; }
  .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .badge.active { background: #dcfce7; color: #166534; }
  .badge.inactive { background: #fee2e2; color: #991b1b; }
  .slug { font-size: 12px; color: #6b7280; margin-bottom: 8px; font-family: monospace; }
  .review-preview { font-size: 13px; color: #4b5563; line-height: 1.4; margin-bottom: 12px; }
  .card-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .card-actions button {
    border: none;
    padding: 7px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-edit { background: #f3f4f6; }
  .btn-edit:hover { background: #e5e7eb; }
  .btn-qr { background: #ede9fe; color: #5b21b6; }
  .btn-qr:hover { background: #ddd6fe; }
  .btn-preview { background: #e0f2fe; color: #0369a1; }
  .btn-preview:hover { background: #bae6fd; }
  .btn-delete { background: #fee2e2; color: #991b1b; }
  .btn-delete:hover { background: #fecaca; }

  .qr-container {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    text-align: center;
  }
  .qr-container img { width: 180px; height: 180px; border-radius: 8px; }
  .qr-url { font-size: 11px; color: #6b7280; margin-top: 6px; word-break: break-all; font-family: monospace; }
  .btn-download {
    display: inline-block;
    margin-top: 8px;
    background: #f3f4f6;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #1f2937;
    text-decoration: none;
    font-family: inherit;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  .modal {
    background: #fff;
    border-radius: 20px;
    padding: 30px;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .modal h2 { margin-bottom: 20px; font-size: 20px; }
  .modal label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 14px;
  }
  .modal input[type="text"],
  .modal input[type="url"],
  .modal textarea {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    margin-top: 5px;
    outline: none;
    transition: border-color 0.2s;
  }
  .modal input:focus, .modal textarea:focus { border-color: #4285f4; }
  .modal textarea { resize: vertical; line-height: 1.5; }
  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 8px;
    flex-direction: row !important;
  }
  .checkbox-label input { width: auto !important; margin: 0 !important; }
  .form-actions { display: flex; gap: 10px; margin-top: 20px; }
  .btn-save {
    flex: 1;
    padding: 12px;
    background: #1a73e8;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    font-size: 14px;
  }
  .btn-save:hover { background: #1557b0; }
  .btn-cancel {
    flex: 1;
    padding: 12px;
    background: #f3f4f6;
    color: #1f2937;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    .admin-container { padding: 16px; }
    .admin-header { flex-direction: column; align-items: flex-start; }
    .pages-grid { grid-template-columns: 1fr; }
  }
`
