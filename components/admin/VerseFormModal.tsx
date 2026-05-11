'use client'

import { useState } from 'react'
import type { Verse } from '@/app/admin/page'

interface Props {
  verse: Verse | null
  category: string
  onClose: () => void
  onSaved: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #ddd8d0',
  borderRadius: '7px',
  fontFamily: 'var(--font-inter)',
  fontSize: '0.85rem',
  outline: 'none',
  backgroundColor: 'var(--cream)',
  resize: 'vertical' as const,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  letterSpacing: '0.07em',
  textTransform: 'uppercase' as const,
  display: 'block',
  marginBottom: '5px',
}

export default function VerseFormModal({ verse, category, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    scripture: verse?.scripture || '',
    reference: verse?.reference || '',
    declaration: verse?.declaration || '',
    commentary: verse?.commentary || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.scripture.trim() || !form.reference.trim()) {
      setError('Scripture and Reference are required.')
      return
    }
    setSaving(true)
    setError('')

    const url = verse ? `/api/admin/verses/${verse._id}` : '/api/admin/verses'
    const method = verse ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, category }),
    })

    if (res.ok) {
      onSaved()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save verse.')
    }
    setSaving(false)
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
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--forest-green)',
            }}
          >
            {verse ? 'Edit Verse' : 'Add New Verse'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.3rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Scripture *</label>
            <textarea
              rows={4}
              value={form.scripture}
              onChange={(e) => update('scripture', e.target.value)}
              placeholder="Enter the full scripture text..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Reference *</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => update('reference', e.target.value)}
              placeholder="e.g. John 3:16 (NIV)"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Declaration</label>
            <textarea
              rows={2}
              value={form.declaration}
              onChange={(e) => update('declaration', e.target.value)}
              placeholder="I declare that I am..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Commentary</label>
            <textarea
              rows={3}
              value={form.commentary}
              onChange={(e) => update('commentary', e.target.value)}
              placeholder="Brief reflection or insight..."
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
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
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                padding: '10px',
                backgroundColor: saving ? '#8aaa8a' : 'var(--forest-green)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : verse ? 'Save Changes' : 'Add Verse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
