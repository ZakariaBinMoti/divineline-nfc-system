import { notFound } from 'next/navigation'
import { getCategoryFromCode, CATEGORY_LABELS } from '@/lib/category'
import { getNextVerseForBracelet } from '@/lib/verse-engine'
import Image from 'next/image'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ bracelet_code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bracelet_code } = await params
  return {
    title: `Today's Verse — DivineLine Media`,
    description: 'Tap your TruthTap™ bracelet to receive a daily word from God.',
  }
}

export default async function VersePage({ params }: Props) {
  const { bracelet_code } = await params

  const category = getCategoryFromCode(bracelet_code)
  if (!category) return notFound()

  const result = await getNextVerseForBracelet(bracelet_code)
  if (!result) return notFound()

  const { verse } = result

  return (
    <main
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream)' }}
    >
      {/* Header */}
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2.5rem', paddingBottom: '1rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <Image
          src="/logo divinemedia.png"
          alt="DivineLine Media"
          width={220}
          height={65}
          style={{ objectFit: 'contain', height: '55px', width: 'auto' }}
          priority
        />
      </header>

      {/* "Today's Verse" label */}
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.03em',
          }}
        >
          Today&rsquo;s Verse
        </p>
      </div>

      {/* Main Verse Content */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        {/* Scripture Quote */}
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

          {/* Reference */}
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
        </div>

        {/* Divider */}
        {(verse.declaration || verse.commentary) && (
          <div className="divider animate-fade-in" style={{ marginBottom: '1.5rem', animationDelay: '0.4s', opacity: 0 }} />
        )}

        {/* Declaration */}
        {verse.declaration && (
          <div
            className="animate-fade-in-up"
            style={{ width: '100%', maxWidth: '400px', animationDelay: '0.45s', opacity: 0 }}
          >
            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontSize: '1.05rem',
                color: 'var(--forest-green-muted)',
                textAlign: 'center',
                lineHeight: 1.55,
                marginBottom: '1.25rem',
              }}
            >
              {verse.declaration}
            </p>
          </div>
        )}

        {/* Commentary */}
        {verse.commentary && (
          <div
            className="animate-fade-in-up"
            style={{ width: '100%', maxWidth: '400px', animationDelay: '0.6s', opacity: 0 }}
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
  )
}
