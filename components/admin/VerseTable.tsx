'use client'

import type { Verse } from '@/app/admin/page'

interface Props {
  verses: Verse[]
  onEdit: (verse: Verse) => void
  onDelete: (id: string) => void
  onToggle: (verse: Verse) => void
}

export default function VerseTable({ verses, onEdit, onDelete, onToggle }: Props) {
  if (verses.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e8e6e0',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', color: 'var(--warm-gray)', marginBottom: 8 }}>
          No verses yet
        </p>
        <p>Add your first verse or upload a CSV file to get started.</p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e6e0',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: '#f8f6f2',
              borderBottom: '1px solid #e8e6e0',
            }}
          >
            {['Reference', 'Scripture', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {verses.map((verse, i) => (
            <tr
              key={verse._id}
              style={{
                borderBottom: i < verses.length - 1 ? '1px solid #f0ede8' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#faf9f7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td
                style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: 'var(--forest-green)',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  minWidth: '140px',
                }}
              >
                {verse.reference}
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.82rem',
                  color: 'var(--text-dark)',
                  maxWidth: '420px',
                }}
              >
                <p
                  style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                  }}
                >
                  {verse.scripture}
                </p>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <button
                  onClick={() => onToggle(verse)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    backgroundColor: verse.active ? 'rgba(45,74,45,0.1)' : 'rgba(180,100,100,0.1)',
                    color: verse.active ? 'var(--forest-green)' : '#c0392b',
                    transition: 'all 0.15s',
                  }}
                >
                  {verse.active ? '● Active' : '○ Inactive'}
                </button>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(verse)}
                    style={{
                      padding: '5px 12px',
                      border: '1px solid #ddd8d0',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(verse._id)}
                    style={{
                      padding: '5px 12px',
                      border: '1px solid #ffddd9',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.75rem',
                      color: '#c0392b',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
