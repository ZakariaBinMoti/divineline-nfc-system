import Image from 'next/image'

export const metadata = {
  title: 'DivineLine Media — TruthTap™',
  description: 'Tap your TruthTap™ bracelet to receive a daily word from God.',
}

export default function Home() {
  return (
    <main
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream)' }}
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

      {/* Main Content */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div
          className="animate-fade-in-up"
          style={{ width: '100%', maxWidth: '400px', opacity: 0 }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(45, 74, 45, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(45, 74, 45, 0.1)'
            }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>📱</span>
            </div>
            
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.8rem',
              fontWeight: 500,
              color: 'var(--forest-green)',
              lineHeight: 1.3
            }}>
              Connect with His Word
            </h2>
            
            <p style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6
            }}>
              Tap your TruthTap&trade; bracelet to your phone to receive your daily verse.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem', paddingTop: '1rem', animationDelay: '0.3s', opacity: 0 }}>
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
