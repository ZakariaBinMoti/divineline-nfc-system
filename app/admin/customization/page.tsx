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

export default function CustomizationPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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

  // Upload background image
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.')
      return
    }

    setUploading(true)
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
        showToast('Background image uploaded!')
      } else {
        const err = await res.json()
        showToast(err.error || 'Upload failed.')
      }
    } catch {
      showToast('Upload failed.')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Delete background image
  async function handleDelete(publicId: string) {
    setDeletingId(publicId)
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
        showToast('Image deleted from Cloudinary.')
      } else {
        showToast('Failed to delete image.')
      }
    } catch {
      showToast('Failed to delete image.')
    }
    setDeletingId(null)
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
      <div style={{
        background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px',
        padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--text-dark)', marginBottom: '1rem', letterSpacing: '0.02em',
        }}>
          Background Mode
        </h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => updateSettings({ backgroundMode: 'solid' })}
            style={{
              ...btnStyle(
                settings.backgroundMode === 'solid' ? 'var(--forest-green)' : 'transparent',
                settings.backgroundMode === 'solid' ? '#fff' : 'var(--text-muted)',
                '1px solid ' + (settings.backgroundMode === 'solid' ? 'var(--forest-green)' : '#ddd8d0')
              ),
              padding: '12px 24px',
              fontSize: '0.85rem',
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
              padding: '12px 24px',
              fontSize: '0.85rem',
            }}
          >
            🖼️ Background Images
          </button>
        </div>
      </div>

      {/* Solid Color Picker */}
      {settings.backgroundMode === 'solid' && (
        <div style={{
          background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600,
            color: 'var(--text-dark)', marginBottom: '1rem', letterSpacing: '0.02em',
          }}>
            Background Color
          </h2>

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

            {/* Quick presets */}
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
        <div style={{
          background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--text-dark)', letterSpacing: '0.02em',
            }}>
              Background Images ({settings.backgroundImages.length})
            </h2>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
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
                {uploading ? '⏳ Uploading...' : '+ Upload Image'}
              </button>
            </div>
          </div>

          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)',
            marginBottom: '1rem', lineHeight: 1.5,
          }}>
            Upload scenery images for the verse page background. A random image will be shown each time a customer taps their bracelet.
          </p>

          {/* Image Grid */}
          {settings.backgroundImages.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', border: '2px dashed #e8e6e0',
              borderRadius: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem',
            }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏞️</p>
              <p>No background images yet.</p>
              <p style={{ fontSize: '0.72rem', marginTop: 4 }}>Click &quot;Upload Image&quot; to add your first scenery background.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {settings.backgroundImages.map((img) => (
                <div
                  key={img.publicId}
                  style={{
                    position: 'relative', borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid #e8e6e0', aspectRatio: '16/10',
                  }}
                >
                  <Image
                    src={img.url}
                    alt="Background"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                  {/* Delete button overlay */}
                  <button
                    onClick={() => handleDelete(img.publicId)}
                    disabled={deletingId === img.publicId}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: 'rgba(192, 57, 43, 0.9)', border: 'none',
                      color: '#fff', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', transition: 'all 0.15s',
                      opacity: deletingId === img.publicId ? 0.5 : 1,
                    }}
                    title="Delete image"
                  >
                    {deletingId === img.publicId ? '⏳' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Preview */}
      <div style={{
        background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px',
        padding: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--text-dark)', marginBottom: '1rem', letterSpacing: '0.02em',
        }}>
          Preview
        </h2>

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
                background: 'rgba(250, 250, 248, 0.82)', backdropFilter: 'blur(2px)',
              }} />
            </>
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: settings.solidColor,
            }} />
          )}

          {/* Preview content */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: '2rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
              fontSize: '1.4rem', color: 'var(--forest-green)',
              textAlign: 'center', lineHeight: 1.3, marginBottom: '0.5rem',
            }}>
              &ldquo;For I know the plans I have for you...&rdquo;
            </p>
            <p style={{
              fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
              fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem',
            }}>
              — Jeremiah 29:11
            </p>
            <div style={{
              background: 'linear-gradient(135deg, rgba(45,74,45,0.06), rgba(45,74,45,0.12))',
              borderLeft: '3px solid var(--forest-green)',
              borderRadius: '0 12px 12px 0',
              padding: '0.75rem 1rem',
              maxWidth: '280px',
            }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '0.5rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--forest-green)', marginBottom: '0.3rem',
              }}>
                ✦ Speak Life:
              </p>
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontStyle: 'italic',
                fontSize: '0.95rem', color: 'var(--forest-green)',
                textAlign: 'center', lineHeight: 1.4,
              }}>
                God has a beautiful plan for my life.
              </p>
            </div>
          </div>
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
