'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Bracelet = {
  _id: string
  bracelet_code: string
  category: string
  status: string
  created_at: string
}

const CATEGORIES = [
  { value: 'identity', label: 'Identity' },
  { value: 'healing', label: 'Healing' },
  { value: 'no-fear', label: 'No Fear' },
  { value: 'kids', label: 'Kids Identity' },
]

type NewRow = { bracelet_code: string; category: string }
const emptyRow = (): NewRow => ({ bracelet_code: '', category: 'identity' })

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ddd8d0',
  borderRadius: '5px',
  fontFamily: 'var(--font-inter)',
  fontSize: '0.82rem',
  outline: 'none',
  backgroundColor: '#fff',
}

const btnStyle = (bg: string, color: string, border?: string): React.CSSProperties => ({
  padding: '5px 12px',
  borderRadius: '6px',
  fontFamily: 'var(--font-inter)',
  fontSize: '0.72rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: border || 'none',
  backgroundColor: bg,
  color,
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
})

export default function BraceletsPage() {
  const [bracelets, setBracelets] = useState<Bracelet[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('')

  // Selection for bulk delete
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Bracelet>>({})

  // Bulk add
  const [newRows, setNewRows] = useState<NewRow[]>([])

  // Upload
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Custom Delete Modal
  const [braceletToDelete, setBraceletToDelete] = useState<string | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const fetchBracelets = useCallback(async () => {
    setLoading(true)
    const url = filterCat ? `/api/admin/bracelets?category=${filterCat}` : '/api/admin/bracelets'
    const res = await fetch(url)
    const data = await res.json()
    setBracelets(Array.isArray(data) ? data : [])
    setLoading(false)
    setSelected(new Set())
    setEditingId(null)
    setNewRows([])
  }, [filterCat])

  useEffect(() => { fetchBracelets() }, [fetchBracelets])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Selection ────────────────────────────────
  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    if (selected.size === bracelets.length) setSelected(new Set())
    else setSelected(new Set(bracelets.map(b => b._id)))
  }

  // ─── Bulk Delete ──────────────────────────────
  async function confirmBulkDelete() {
    setBulkDeleteConfirm(false)
    await Promise.all(
      Array.from(selected).map(id =>
        fetch(`/api/admin/bracelets/${id}`, { method: 'DELETE' })
      )
    )
    showToast(`${selected.size} bracelet(s) deleted.`)
    fetchBracelets()
  }

  // ─── Single Delete ────────────────────────────
  async function confirmSingleDelete() {
    if (!braceletToDelete) return
    await fetch(`/api/admin/bracelets/${braceletToDelete}`, { method: 'DELETE' })
    showToast('Bracelet deleted.')
    setBraceletToDelete(null)
    fetchBracelets()
  }

  // ─── Toggle Status ────────────────────────────
  async function handleToggle(bracelet: Bracelet) {
    const newStatus = bracelet.status === 'active' ? 'inactive' : 'active'
    await fetch(`/api/admin/bracelets/${bracelet._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    showToast(`Bracelet ${newStatus}.`)
    fetchBracelets()
  }

  // ─── Inline Edit ──────────────────────────────
  function startEdit(bracelet: Bracelet) {
    setEditingId(bracelet._id)
    setEditData({ bracelet_code: bracelet.bracelet_code, category: bracelet.category })
  }
  async function saveEdit() {
    if (!editingId) return
    await fetch(`/api/admin/bracelets/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    showToast('Bracelet updated.')
    setEditingId(null)
    fetchBracelets()
  }

  // ─── Bulk Add ─────────────────────────────────
  function addNewRow() { setNewRows(prev => [...prev, emptyRow()]) }
  function updateNewRow(index: number, field: keyof NewRow, value: string) {
    setNewRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }
  function removeNewRow(index: number) { setNewRows(prev => prev.filter((_, i) => i !== index)) }

  async function saveNewRows() {
    const valid = newRows.filter(r => r.bracelet_code.trim())
    if (valid.length === 0) { showToast('Fill in bracelet code for at least one row.'); return }

    const results = await Promise.allSettled(
      valid.map(row =>
        fetch('/api/admin/bracelets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bracelet_code: row.bracelet_code.toUpperCase(), category: row.category }),
        }).then(r => r.json())
      )
    )
    const ok = results.filter(r => r.status === 'fulfilled').length
    showToast(`${ok} bracelet(s) added.`)
    fetchBracelets()
  }

  // ─── Upload ───────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/bracelets/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      showToast(`${data.inserted} bracelet(s) uploaded.${data.skippedDuplicates?.length ? ` ${data.skippedDuplicates.length} duplicates skipped.` : ''}`)
      fetchBracelets()
    } else {
      showToast(data.error || 'Upload failed.')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const categoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--forest-green)' }}>
            Bracelet Manager
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Manage all TruthTap™ bracelet IDs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Download All Data */}
          <a
            href="/api/admin/bracelets/export"
            style={btnStyle('transparent', 'var(--forest-green)', '1px solid var(--forest-green)')}
          >
            ↓ Download All Data
          </a>
          {/* Upload CSV */}
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={btnStyle('transparent', 'var(--forest-green)', '1px solid var(--forest-green)')}>
            {uploading ? 'Uploading...' : '↑ Upload Data'}
          </button>
        </div>
      </div>

      {/* Filter + Bulk Delete Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{
            padding: '7px 12px', border: '1px solid #ddd8d0', borderRadius: '7px',
            fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: 'var(--text-dark)',
            backgroundColor: '#fff', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
        </select>

        {selected.size > 0 && (
          <>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: '#c0392b', fontWeight: 500 }}>
            {selected.size} selected
          </span>
          <button onClick={() => setBulkDeleteConfirm(true)} style={btnStyle('#c0392b', '#fff')}>
            🗑 Delete Selected
          </button>
            <button onClick={() => setSelected(new Set())} style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}>Cancel</button>
          </>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
          Loading bracelets...
        </p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e6e0', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f6f2', borderBottom: '1px solid #e8e6e0' }}>
                <th style={{ padding: '10px 12px', width: '30px' }}>
                  <input type="checkbox" checked={bracelets.length > 0 && selected.size === bracelets.length} onChange={toggleSelectAll} />
                </th>
                {['Bracelet Code', 'Category', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-inter)',
                    fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bracelets.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f0ede8' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
                  onMouseLeave={e => (e.currentTarget.style.background = editingId === b._id ? '#fffdf5' : 'transparent')}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={selected.has(b._id)} onChange={() => toggleSelect(b._id)} />
                  </td>
                  {editingId === b._id ? (
                    <>
                      <td style={{ padding: '8px 8px' }}>
                        <input value={editData.bracelet_code || ''} onChange={e => setEditData(d => ({ ...d, bracelet_code: e.target.value.toUpperCase() }))} style={inputStyle} />
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <select value={editData.category || ''} onChange={e => setEditData(d => ({ ...d, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                          {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleToggle(b)} style={{
                          padding: '3px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-inter)', fontSize: '0.68rem', fontWeight: 500,
                          backgroundColor: b.status === 'active' ? 'rgba(45,74,45,0.1)' : 'rgba(180,100,100,0.1)',
                          color: b.status === 'active' ? 'var(--forest-green)' : '#c0392b',
                        }}>{b.status === 'active' ? '● Active' : '○ Inactive'}</button>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={saveEdit} style={btnStyle('var(--forest-green)', '#fff')}>Save</button>
                          <button onClick={() => setEditingId(null)} style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-green)', letterSpacing: '0.05em' }}>
                        {b.bracelet_code}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {categoryLabel(b.category)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleToggle(b)} style={{
                          padding: '3px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-inter)', fontSize: '0.68rem', fontWeight: 500,
                          backgroundColor: b.status === 'active' ? 'rgba(45,74,45,0.1)' : 'rgba(180,100,100,0.1)',
                          color: b.status === 'active' ? 'var(--forest-green)' : '#c0392b',
                        }}>{b.status === 'active' ? '● Active' : '○ Inactive'}</button>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => startEdit(b)} style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}>Edit</button>
                          <button onClick={() => setBraceletToDelete(b._id)} style={btnStyle('transparent', '#c0392b', '1px solid #ffddd9')}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* New rows for bulk add */}
              {newRows.map((row, i) => (
                <tr key={`new-${i}`} style={{ borderBottom: '1px solid #f0ede8', backgroundColor: '#f0faf0' }}>
                  <td style={{ padding: '10px 12px' }} />
                  <td style={{ padding: '8px 8px' }}>
                    <input value={row.bracelet_code} onChange={e => updateNewRow(i, 'bracelet_code', e.target.value.toUpperCase())} placeholder="e.g. ID-0002" style={inputStyle} />
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <select value={row.category} onChange={e => updateNewRow(i, 'category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
                    </select>
                  </td>
                  <td colSpan={2} style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.7rem' }}>New</td>
                  <td style={{ padding: '8px 8px' }}>
                    <button onClick={() => removeNewRow(i)} style={btnStyle('transparent', '#c0392b', '1px solid #ffddd9')}>✕</button>
                  </td>
                </tr>
              ))}

              {/* Empty */}
              {bracelets.length === 0 && newRows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
                    No bracelets found. Click "+ Add Row" or upload a CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Save new rows */}
      {/* Add new row & Save controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <button onClick={addNewRow} style={btnStyle('transparent', 'var(--forest-green)', '1px solid var(--forest-green)')}>
          + Add Row
        </button>
        {newRows.length > 0 && (
          <>
            <button onClick={() => setNewRows([])} style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}>Discard All</button>
            <button onClick={saveNewRows} style={btnStyle('var(--forest-green)', '#fff')}>
              Save {newRows.filter(r => r.bracelet_code.trim()).length} Bracelet(s)
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      {(braceletToDelete || bulkDeleteConfirm) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: '24px', borderRadius: '12px',
            maxWidth: '400px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            fontFamily: 'var(--font-inter)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {bulkDeleteConfirm 
                ? `Are you sure you want to delete ${selected.size} bracelet(s)? This cannot be undone.`
                : `Are you sure you want to delete this bracelet? This cannot be undone.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setBraceletToDelete(null); setBulkDeleteConfirm(false) }} style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}>
                Cancel
              </button>
              <button onClick={bulkDeleteConfirm ? confirmBulkDelete : confirmSingleDelete} style={btnStyle('#c0392b', '#fff')}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          backgroundColor: 'var(--forest-green)', color: '#fff',
          padding: '12px 20px', borderRadius: '8px',
          fontFamily: 'var(--font-inter)', fontSize: '0.82rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100,
          animation: 'fadeInUp 0.3s ease',
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
