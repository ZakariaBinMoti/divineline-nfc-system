'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Verses' },
    { href: '/admin/bracelets', label: 'Bracelets' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: 'var(--font-inter)' }}>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav-trigger { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-trigger { display: flex !important; }
        }
      `}</style>
      {/* Top Nav */}
      <nav
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8e6e0',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand Logo */}
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Image
            src="/logo divinemedia.png"
            alt="DivineLine Media"
            width={140}
            height={40}
            style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
            priority
          />
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              background: 'rgba(45,74,45,0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            Admin
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ alignItems: 'center', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--forest-green)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'rgba(45,74,45,0.07)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{
              marginLeft: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.8rem',
              color: '#c0392b',
              backgroundColor: 'transparent',
              border: '1px solid #ffddd9',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Mobile Nav Trigger */}
        <button
          className="mobile-nav-trigger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-dark)',
          }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" style={{
          position: 'fixed',
          top: '60px',
          right: '1.5rem',
          background: '#fff',
          border: '1px solid #e8e6e0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.75rem',
          gap: '4px',
          zIndex: 60,
          minWidth: '180px'
        }}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--forest-green)' : 'var(--text-dark)',
                  backgroundColor: isActive ? 'rgba(45,74,45,0.07)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={() => { setIsMenuOpen(false); signOut({ callbackUrl: '/admin/login' }); }}
            style={{
              marginTop: '8px',
              padding: '12px 16px',
              borderRadius: '6px',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.9rem',
              color: '#c0392b',
              backgroundColor: 'transparent',
              border: '1px solid #ffddd9',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </div>
      )}

      {/* Page content — using inline styles instead of Tailwind classes */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>{children}</main>
    </div>
  )
}
