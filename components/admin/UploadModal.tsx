'use client'

import { useRef, useState } from 'react'

interface Props {
  category: string
  onClose: () => void
  onUploaded: () => void
}

export default function UploadModal({ category, onClose, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ inserted?: number; errors?: string[] } | null>(null)
  const [error, setError] = useState('')

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Please select a file.'); return }

    setUploading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok) {
      setResult({ inserted: data.inserted, errors: data.skippedErrors })
      onUploaded()
    } else {
      setError(data.error || 'Upload failed.')
    }
    setUploading(false)
  }

  const categoryLabel: Record<string, string> = {
    identity: 'Identity',
    healing: 'Healing',
    'no-fear': 'No Fear',
    kids: 'Kids Identity',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--forest-green)',
            }}
          >
            Upload Verses — {categoryLabel[category]}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: '#f8f6f2',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--text-dark)' }}>Required columns (case-insensitive):</strong>
          <br />
          <code style={{ color: 'var(--forest-green)' }}>scripture</code> · <code style={{ color: 'var(--forest-green)' }}>reference</code>
          <br />
          <strong style={{ color: 'var(--text-dark)', marginTop: 4, display: 'block' }}>Optional columns:</strong>
          <code style={{ color: 'var(--forest-green)' }}>declaration</code> · <code style={{ color: 'var(--forest-green)' }}>commentary</code>
          <br />
          <span style={{ marginTop: 4, display: 'block' }}>Supported: <strong>.csv</strong> or <strong>.xlsx</strong></span>
        </div>

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #ddd8d0',
            borderRadius: '10px',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--forest-green)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#ddd8d0')}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {fileName ? (
              <span style={{ color: 'var(--forest-green)', fontWeight: 500 }}>📄 {fileName}</span>
            ) : (
              <>Click to select CSV or Excel file</>
            )}
          </p>
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              background: 'rgba(45,74,45,0.07)',
              border: '1px solid rgba(45,74,45,0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '1rem',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.8rem',
              color: 'var(--forest-green)',
            }}
          >
            ✓ {result.inserted} verse{result.inserted !== 1 ? 's' : ''} imported successfully.
            {result.errors && result.errors.length > 0 && (
              <ul style={{ marginTop: 6, color: '#c0392b' }}>
                {result.errors.slice(0, 5).map((e, i) => <li key={i}>⚠ {e}</li>)}
              </ul>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#c0392b', fontSize: '0.8rem', fontFamily: 'var(--font-inter)', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd8d0',
              borderRadius: '8px',
              background: 'transparent',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={uploading || !fileName}
              style={{
                flex: 2,
                padding: '10px',
                backgroundColor: uploading || !fileName ? '#8aaa8a' : 'var(--forest-green)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: uploading || !fileName ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Verses'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
