import { notFound } from 'next/navigation'
import { getCategoryFromCode, CATEGORY_LABELS } from '@/lib/category'
import { getNextVerseForBracelet } from '@/lib/verse-engine'
import { connectDB } from '@/lib/db'
import { getSettings } from '@/lib/models/SiteSettings'
import Image from 'next/image'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ bracelet_code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bracelet_code } = await params
  return {
    title: `Your Verse — DivineLine Media`,
    description: 'Tap your TruthTap™ bracelet to receive a word from God.',
  }
}

export default async function VersePage({ params }: Props) {
  const { bracelet_code } = await params

  const category = getCategoryFromCode(bracelet_code)
  if (!category) return notFound()

  const result = await getNextVerseForBracelet(bracelet_code)
  if (!result) return notFound()

  const { verse } = result

  // Fetch site settings for display control
  await connectDB()
  const settings = await getSettings()

  // Pick a random background image if in images mode
  let backgroundImageUrl: string | null = null
  if (settings.backgroundMode === 'images' && settings.backgroundImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * settings.backgroundImages.length)
    backgroundImageUrl = settings.backgroundImages[randomIndex].url
  }

  const bgColor = settings.backgroundMode === 'solid' ? settings.solidColor : 'transparent'
  const hasImageBg = !!backgroundImageUrl

  // Overlay settings
  const overlayColor = settings.overlayColor || '#000000'
  const overlayOpacity = settings.overlayOpacity ?? 0.4
  const overlayBlur = settings.overlayBlur ?? 2

  // Text color — use custom text color when background images are active
  const textColor = hasImageBg ? (settings.textColor || '#FFFFFF') : undefined

  // Convert hex to rgba for the overlay
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <>
      {/* Background image layer with dynamic overlay */}
      {backgroundImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dynamic overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: hexToRgba(overlayColor, overlayOpacity),
              backdropFilter: `blur(${overlayBlur}px)`,
              WebkitBackdropFilter: `blur(${overlayBlur}px)`,
            }}
          />
        </div>
      )}

      <main
        className="verse-content"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: backgroundImageUrl ? 'transparent' : bgColor,
        }}
      >
        {/* Header */}
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2.5rem', paddingBottom: '1rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <Image
            src="/truthtaplogo-transparent.png"
            alt="DivineLine Media"
            width={220}
            height={65}
            style={{ objectFit: 'contain', height: '55px', width: 'auto' }}
            priority
          />
        </header>

        {/* Main Verse Content */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          {/* Scripture Quote */}
          {settings.showScripture && (
            <div
              className="animate-fade-in-up"
              style={{ width: '100%', maxWidth: '400px', animationDelay: '0.15s', opacity: 0 }}
            >
              <blockquote
                className={hasImageBg ? undefined : 'verse-text'}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.6rem, 6.5vw, 2.2rem)',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  color: textColor || 'var(--forest-green)',
                }}
              >
                &ldquo;{verse.scripture}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Reference */}
          {settings.showReference && (
            <p
              className="animate-fade-in-up"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontSize: '1rem',
                marginBottom: '2rem',
                animationDelay: '0.3s',
                opacity: 0,
                textAlign: 'center',
                color: textColor ? `${textColor}cc` : 'var(--text-muted)',
              }}
            >
              &mdash; {verse.reference}
            </p>
          )}

          {/* Divider before declaration */}
          {settings.showDeclaration && verse.declaration && (
            <div
              className="animate-fade-in"
              style={{
                width: '60px',
                height: '1px',
                background: textColor ? `${textColor}40` : 'var(--light-gray)',
                margin: '0 auto',
                marginBottom: '1.5rem',
                animationDelay: '0.4s',
                opacity: 0,
              }}
            />
          )}

          {/* Declaration with "Speak Life:" label and bubble styling */}
          {settings.showDeclaration && verse.declaration && (
            <div
              className="animate-fade-in-up"
              style={{ width: '100%', maxWidth: '420px', animationDelay: '0.45s', opacity: 0 }}
            >
              <div
                style={{
                  background: hasImageBg
                    ? `${textColor || '#FFFFFF'}15`
                    : 'linear-gradient(135deg, rgba(45, 74, 45, 0.06) 0%, rgba(45, 74, 45, 0.12) 100%)',
                  borderLeft: `3px solid ${hasImageBg ? (textColor || '#FFFFFF') : 'var(--forest-green)'}`,
                  borderRadius: '0 12px 12px 0',
                  padding: '1.25rem 1.5rem',
                  backdropFilter: hasImageBg ? 'blur(4px)' : undefined,
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase' as const,
                  color: textColor || 'var(--forest-green)',
                  marginBottom: '0.6rem',
                }}>
                  ✦ Speak Life:
                </p>
                <p style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.3rem, 5vw, 1.7rem)',
                  color: textColor || 'var(--forest-green)',
                  textAlign: 'center',
                  lineHeight: 1.45,
                }}>
                  {verse.declaration}
                </p>
              </div>
            </div>
          )}

          {/* Commentary */}
          {settings.showCommentary && verse.commentary && (
            <div
              className="animate-fade-in-up"
              style={{ width: '100%', maxWidth: '400px', animationDelay: '0.6s', opacity: 0, marginTop: '1.5rem' }}
            >
              <div
                className="animate-fade-in"
                style={{
                  width: '60px',
                  height: '1px',
                  background: textColor ? `${textColor}40` : 'var(--light-gray)',
                  margin: '0 auto',
                  marginBottom: '1rem',
                  animationDelay: '0.55s',
                  opacity: 0,
                }}
              />
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.82rem',
                  color: textColor ? `${textColor}cc` : 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.7,
                  letterSpacing: '0.01em',
                }}
              >
                {verse.commentary}
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem', paddingTop: '1rem', animationDelay: '0.7s', opacity: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: textColor ? `${textColor}80` : 'var(--warm-gray)',
              textTransform: 'uppercase',
            }}
          >
            @2026 divinelinemedia.com
          </p>
        </footer>
      </main>
    </>
  )
}
