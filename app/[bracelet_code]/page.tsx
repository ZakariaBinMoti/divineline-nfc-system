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

  return (
    <>
      {/* Background image layer */}
      {backgroundImageUrl && (
        <div
          className="verse-bg-overlay"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
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
                className="verse-text"
                style={{
                  fontSize: 'clamp(1.6rem, 6.5vw, 2.2rem)',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                }}
              >
                &ldquo;{verse.scripture}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Reference */}
          {settings.showReference && (
            <p
              className="verse-reference animate-fade-in-up"
              style={{
                fontSize: '1rem',
                marginBottom: '2rem',
                animationDelay: '0.3s',
                opacity: 0,
                textAlign: 'center',
              }}
            >
              &mdash; {verse.reference}
            </p>
          )}

          {/* Divider before declaration */}
          {settings.showDeclaration && verse.declaration && (
            <div className="divider animate-fade-in" style={{ marginBottom: '1.5rem', animationDelay: '0.4s', opacity: 0 }} />
          )}

          {/* Declaration with "Speak Life:" label and bubble styling */}
          {settings.showDeclaration && verse.declaration && (
            <div
              className="animate-fade-in-up"
              style={{ width: '100%', maxWidth: '420px', animationDelay: '0.45s', opacity: 0 }}
            >
              <div className="declaration-bubble">
                <p className="declaration-label">
                  ✦ Speak Life:
                </p>
                <p className="declaration-text">
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
              <div className="divider animate-fade-in" style={{ marginBottom: '1rem', animationDelay: '0.55s', opacity: 0 }} />
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
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
              color: 'var(--warm-gray)',
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
