'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type BackgroundImage = {
  url: string
  publicId: string
}

type Settings = {
  backgroundMode: 'solid' | 'images'
  solidColor: string
  backgroundImages: BackgroundImage[]
  showReference: boolean
  showScripture: boolean
  showDeclaration: boolean
  showCommentary: boolean
  overlayColor: string
  overlayOpacity: number
  overlayBlur: number
  textColor: string
}

const btnStyle = (bg: string, color: string, border?: string): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '8px',
  fontFamily: 'var(--font-inter)',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: border || 'none',
  backgroundColor: bg,
  color,
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
})

const sectionCard: React.CSSProperties = {
  background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px',
  padding: '1.5rem', marginBottom: '1.5rem',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600,
  color: 'var(--text-dark)', marginBottom: '1rem', letterSpacing: '0.02em',
}

export default function CustomizationPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch {
        showToast('Failed to load settings.')
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  // Update settings
  async function updateSettings(updates: Partial<Settings>) {
    if (!settings) return
    setSettings(prev => prev ? { ...prev, ...updates } : prev)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        showToast('Settings updated.')
      }
    } catch {
      showToast('Failed to update settings.')
    }
  }

  // Upload multiple background images
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      showToast('Please select image files.')
      return
    }

    setUploading(true)
    let uploaded = 0
    const total = imageFiles.length

    for (const file of imageFiles) {
      setUploadProgress(`Uploading ${uploaded + 1} of ${total}...`)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/backgrounds', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          setSettings(prev =>
            prev ? {
              ...prev,
              backgroundImages: [...prev.backgroundImages, { url: data.url, publicId: data.publicId }],
            } : prev
          )
          uploaded++
        } else {
          const err = await res.json()
          showToast(`Failed: ${file.name} — ${err.error || 'Upload error'}`)
        }
      } catch {
        showToast(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    setUploadProgress('')
    showToast(`${uploaded} of ${total} image(s) uploaded!`)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Delete single background image
  async function handleDelete(publicId: string) {
    setDeletingIds(prev => new Set(prev).add(publicId))
    try {
      const res = await fetch('/api/admin/backgrounds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      })
      if (res.ok) {
        setSettings(prev =>
          prev ? {
            ...prev,
            backgroundImages: prev.backgroundImages.filter(img => img.publicId !== publicId),
          } : prev
        )
        setSelectedImages(prev => {
          const next = new Set(prev)
          next.delete(publicId)
          return next
        })
      } else {
        showToast('Failed to delete image.')
      }
    } catch {
      showToast('Failed to delete image.')
    }
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(publicId)
      return next
    })
  }

  // Bulk delete selected images
  async function handleBulkDelete() {
    if (selectedImages.size === 0) return
    setBulkDeleting(true)
    const ids = Array.from(selectedImages)
    let deleted = 0

    for (const publicId of ids) {
      try {
        const res = await fetch('/api/admin/backgrounds', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        })
        if (res.ok) {
          setSettings(prev =>
            prev ? {
              ...prev,
              backgroundImages: prev.backgroundImages.filter(img => img.publicId !== publicId),
            } : prev
          )
          deleted++
        }
      } catch { /* continue */ }
    }

    setSelectedImages(new Set())
    setBulkDeleting(false)
    showToast(`${deleted} image(s) deleted.`)
  }

  // Toggle image selection
  function toggleImageSelect(publicId: string) {
    setSelectedImages(prev => {
      const next = new Set(prev)
      next.has(publicId) ? next.delete(publicId) : next.add(publicId)
      return next
    })
  }

  function toggleSelectAll() {
    if (!settings) return
    if (selectedImages.size === settings.backgroundImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(settings.backgroundImages.map(img => img.publicId)))
    }
  }

  // Helper to convert hex to rgba
  function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
        Loading settings...
      </div>
    )
  }

  if (!settings) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#c0392b', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
        Failed to load settings.
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--forest-green)' }}>
          Customization
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Manage the background appearance of the customer-facing verse page
        </p>
      </div>

      {/* Background Mode Selection */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>Background Mode</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => updateSettings({ backgroundMode: 'solid' })}
            style={{
              ...btnStyle(
                settings.backgroundMode === 'solid' ? 'var(--forest-green)' : 'transparent',
                settings.backgroundMode === 'solid' ? '#fff' : 'var(--text-muted)',
                '1px solid ' + (settings.backgroundMode === 'solid' ? 'var(--forest-green)' : '#ddd8d0')
              ),
              padding: '12px 24px', fontSize: '0.85rem',
            }}
          >
            🎨 Solid Color
          </button>
          <button
            onClick={() => updateSettings({ backgroundMode: 'images' })}
            style={{
              ...btnStyle(
                settings.backgroundMode === 'images' ? 'var(--forest-green)' : 'transparent',
                settings.backgroundMode === 'images' ? '#fff' : 'var(--text-muted)',
                '1px solid ' + (settings.backgroundMode === 'images' ? 'var(--forest-green)' : '#ddd8d0')
              ),
              padding: '12px 24px', fontSize: '0.85rem',
            }}
          >
            🖼️ Background Images
          </button>
        </div>
      </div>

      {/* Solid Color Picker */}
      {settings.backgroundMode === 'solid' && (
        <div style={sectionCard}>
          <h2 style={sectionTitle}>Background Color</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              position: 'relative', width: '60px', height: '60px', borderRadius: '12px',
              border: '2px solid #e8e6e0', overflow: 'hidden',
            }}>
              <input
                type="color"
                value={settings.solidColor}
                onChange={(e) => setSettings(prev => prev ? { ...prev, solidColor: e.target.value } : prev)}
                onBlur={(e) => updateSettings({ solidColor: e.target.value })}
                style={{
                  position: 'absolute', top: '-10px', left: '-10px',
                  width: '80px', height: '80px', border: 'none', cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                {settings.solidColor}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Click to choose a color
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
              {[
                { color: '#FAFAF8', label: 'Cream' },
                { color: '#FFFFFF', label: 'White' },
                { color: '#F5F0E8', label: 'Warm' },
                { color: '#E8EDE8', label: 'Sage' },
                { color: '#1a1a2e', label: 'Dark' },
              ].map(preset => (
                <button
                  key={preset.color}
                  onClick={() => updateSettings({ solidColor: preset.color })}
                  title={preset.label}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    backgroundColor: preset.color,
                    border: settings.solidColor === preset.color ? '2px solid var(--forest-green)' : '1px solid #ddd8d0',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Images Manager */}
      {settings.backgroundMode === 'images' && (
        <>
          <div style={sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
                Background Images ({settings.backgroundImages.length})
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Select All */}
                {settings.backgroundImages.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}
                  >
                    {selectedImages.size === settings.backgroundImages.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                {/* Bulk Delete */}
                {selectedImages.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    style={btnStyle(bulkDeleting ? '#e8a0a0' : '#c0392b', '#fff')}
                  >
                    {bulkDeleting ? '⏳ Deleting...' : `🗑 Delete ${selectedImages.size} Selected`}
                  </button>
                )}
                {/* Upload */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={btnStyle(
                    uploading ? '#8aaa8a' : 'var(--forest-green)',
                    '#fff',
                  )}
                >
                  {uploading ? `⏳ ${uploadProgress || 'Uploading...'}` : '+ Upload Images'}
                </button>
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)',
              marginBottom: '1rem', lineHeight: 1.5,
            }}>
              Upload scenery images for the verse page background. A random image will be shown each time a customer taps their bracelet. Select multiple files at once to bulk upload.
            </p>

            {/* Image Grid */}
            {settings.backgroundImages.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '3rem', border: '2px dashed #e8e6e0',
                borderRadius: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem',
              }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏞️</p>
                <p>No background images yet.</p>
                <p style={{ fontSize: '0.72rem', marginTop: 4 }}>Click &quot;Upload Images&quot; to add scenery backgrounds. You can select multiple files at once.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
              }}>
                {settings.backgroundImages.map((img) => {
                  const isSelected = selectedImages.has(img.publicId)
                  const isDeleting = deletingIds.has(img.publicId)
                  return (
                    <div
                      key={img.publicId}
                      onClick={() => toggleImageSelect(img.publicId)}
                      style={{
                        position: 'relative', borderRadius: '10px', overflow: 'hidden',
                        border: isSelected ? '3px solid var(--forest-green)' : '1px solid #e8e6e0',
                        aspectRatio: '16/10', cursor: 'pointer',
                        transition: 'border 0.15s',
                      }}
                    >
                      <Image
                        src={img.url}
                        alt="Background"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 200px"
                      />
                      {/* Selection checkbox */}
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        width: '22px', height: '22px', borderRadius: '4px',
                        backgroundColor: isSelected ? 'var(--forest-green)' : 'rgba(255,255,255,0.85)',
                        border: isSelected ? 'none' : '1.5px solid #ccc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: '#fff', fontWeight: 700,
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && '✓'}
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.publicId) }}
                        disabled={isDeleting}
                        style={{
                          position: 'absolute', top: '8px', right: '8px',
                          width: '28px', height: '28px', borderRadius: '50%',
                          backgroundColor: 'rgba(192, 57, 43, 0.9)', border: 'none',
                          color: '#fff', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', transition: 'all 0.15s',
                          opacity: isDeleting ? 0.5 : 1,
                        }}
                        title="Delete image"
                      >
                        {isDeleting ? '⏳' : '✕'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Overlay Settings */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Image Overlay</h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Control the overlay color, opacity, and blur applied on top of background images for text readability.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Overlay Color */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-dark)', minWidth: '100px' }}>
                  Overlay Color
                </label>
                <div style={{
                  position: 'relative', width: '40px', height: '40px', borderRadius: '8px',
                  border: '2px solid #e8e6e0', overflow: 'hidden',
                }}>
                  <input
                    type="color"
                    value={settings.overlayColor}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, overlayColor: e.target.value } : prev)}
                    onBlur={(e) => updateSettings({ overlayColor: e.target.value })}
                    style={{
                      position: 'absolute', top: '-8px', left: '-8px',
                      width: '56px', height: '56px', border: 'none', cursor: 'pointer',
                    }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {settings.overlayColor}
                </span>
                {/* Quick presets */}
                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                  {[
                    { color: '#000000', label: 'Black' },
                    { color: '#1a1a2e', label: 'Dark Navy' },
                    { color: '#2D4A2D', label: 'Forest' },
                    { color: '#FAFAF8', label: 'Cream' },
                  ].map(preset => (
                    <button
                      key={preset.color}
                      onClick={() => updateSettings({ overlayColor: preset.color })}
                      title={preset.label}
                      style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        backgroundColor: preset.color,
                        border: settings.overlayColor === preset.color ? '2px solid var(--forest-green)' : '1px solid #ddd8d0',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Overlay Opacity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-dark)', minWidth: '100px' }}>
                  Opacity
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={settings.overlayOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    setSettings(prev => prev ? { ...prev, overlayOpacity: val } : prev)
                  }}
                  onMouseUp={(e) => updateSettings({ overlayOpacity: parseFloat((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => updateSettings({ overlayOpacity: parseFloat((e.target as HTMLInputElement).value) })}
                  style={{ flex: 1, accentColor: 'var(--forest-green)' }}
                />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dark)', minWidth: '35px', textAlign: 'right' }}>
                  {(settings.overlayOpacity * 100).toFixed(0)}%
                </span>
              </div>

              {/* Overlay Blur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-dark)', minWidth: '100px' }}>
                  Blur
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.overlayBlur}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    setSettings(prev => prev ? { ...prev, overlayBlur: val } : prev)
                  }}
                  onMouseUp={(e) => updateSettings({ overlayBlur: parseInt((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => updateSettings({ overlayBlur: parseInt((e.target as HTMLInputElement).value) })}
                  style={{ flex: 1, accentColor: 'var(--forest-green)' }}
                />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dark)', minWidth: '35px', textAlign: 'right' }}>
                  {settings.overlayBlur}px
                </span>
              </div>
            </div>
          </div>

          {/* Text Color */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Text Color</h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Set the text color for all content displayed over background images (scripture, reference, declaration, commentary, footer).
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                position: 'relative', width: '50px', height: '50px', borderRadius: '10px',
                border: '2px solid #e8e6e0', overflow: 'hidden',
              }}>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, textColor: e.target.value } : prev)}
                  onBlur={(e) => updateSettings({ textColor: e.target.value })}
                  style={{
                    position: 'absolute', top: '-10px', left: '-10px',
                    width: '70px', height: '70px', border: 'none', cursor: 'pointer',
                  }}
                />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                  {settings.textColor}
                </p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Applied when background images are active
                </p>
              </div>
              {/* Quick presets */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {[
                  { color: '#FFFFFF', label: 'White' },
                  { color: '#FAFAF8', label: 'Cream' },
                  { color: '#F0E6D4', label: 'Warm White' },
                  { color: '#2D4A2D', label: 'Forest Green' },
                  { color: '#1a1a1a', label: 'Black' },
                ].map(preset => (
                  <button
                    key={preset.color}
                    onClick={() => updateSettings({ textColor: preset.color })}
                    title={preset.label}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      backgroundColor: preset.color,
                      border: settings.textColor === preset.color ? '2px solid var(--forest-green)' : '1px solid #ddd8d0',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Live Preview */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>Preview</h2>

        <div style={{
          position: 'relative', borderRadius: '12px', overflow: 'hidden',
          height: '300px', border: '1px solid #e8e6e0',
        }}>
          {/* Background */}
          {settings.backgroundMode === 'images' && settings.backgroundImages.length > 0 ? (
            <>
              <Image
                src={settings.backgroundImages[0].url}
                alt="Preview background"
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: hexToRgba(settings.overlayColor, settings.overlayOpacity),
                backdropFilter: `blur(${settings.overlayBlur}px)`,
              }} />
            </>
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: settings.solidColor,
            }} />
          )}

          {/* Preview content */}
          {(() => {
            const hasImageBg = settings.backgroundMode === 'images' && settings.backgroundImages.length > 0
            const previewTextColor = hasImageBg ? settings.textColor : 'var(--forest-green)'
            const previewMutedColor = hasImageBg ? `${settings.textColor}cc` : 'var(--text-muted)'
            return (
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', padding: '2rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                  fontSize: '1.4rem', color: previewTextColor,
                  textAlign: 'center', lineHeight: 1.3, marginBottom: '0.5rem',
                }}>
                  &ldquo;For I know the plans I have for you...&rdquo;
                </p>
                <p style={{
                  fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                  fontSize: '0.85rem', color: previewMutedColor, marginBottom: '1rem',
                }}>
                  — Jeremiah 29:11
                </p>
                <div style={{
                  background: hasImageBg
                    ? `${settings.textColor}15`
                    : 'linear-gradient(135deg, rgba(45,74,45,0.06), rgba(45,74,45,0.12))',
                  borderLeft: `3px solid ${previewTextColor}`,
                  borderRadius: '0 12px 12px 0',
                  padding: '0.75rem 1rem',
                  maxWidth: '280px',
                  backdropFilter: hasImageBg ? 'blur(4px)' : undefined,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '0.5rem', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: previewTextColor, marginBottom: '0.3rem',
                  }}>
                    ✦ Speak Life:
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontStyle: 'italic',
                    fontSize: '0.95rem', color: previewTextColor,
                    textAlign: 'center', lineHeight: 1.4,
                  }}>
                    God has a beautiful plan for my life.
                  </p>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

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
