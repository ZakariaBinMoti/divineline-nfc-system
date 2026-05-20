'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/admin')
    } else {
      setError('Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--cream)' }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/truthtaplogo-transparent.png"
            alt="DivineLine Media"
            width={260}
            height={80}
            style={{ objectFit: 'contain', height: '70px', width: 'auto' }}
            priority
          />
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8e6e0',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 20px rgba(45,74,45,0.06)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ddd8d0',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: 'var(--cream)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #ddd8d0',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: 'var(--cream)',
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#c0392b', fontSize: '0.8rem', fontFamily: 'var(--font-inter)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '11px',
                backgroundColor: loading ? '#8aaa8a' : 'var(--forest-green)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
