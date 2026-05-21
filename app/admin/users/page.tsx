'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

type AdminUser = {
  _id: string
  email: string
  name: string
  createdAt: string
}

const SUPER_ADMIN_EMAIL = 'divinelinemedia25@gmail.com'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #ddd8d0',
  borderRadius: '8px',
  fontFamily: 'var(--font-inter)',
  fontSize: '0.85rem',
  outline: 'none',
  backgroundColor: '#fff',
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
  background: '#fff',
  border: '1px solid #e8e6e0',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-dark)',
  marginBottom: '1rem',
  letterSpacing: '0.02em',
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  fontSize: '1rem',
  color: 'var(--text-muted)',
  lineHeight: 1,
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  required?: boolean
  minLength?: number
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        style={{ ...inputStyle, paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={eyeBtnStyle}
        tabIndex={-1}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Add admin form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch {
      showToast('Failed to load admin users.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  // Add new admin
  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast('All fields are required.')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.')
      return
    }

    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), password: newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setAdmins(prev => [...prev, data])
        setNewName('')
        setNewEmail('')
        setNewPassword('')
        setShowAddForm(false)
        showToast('Admin added successfully.')
      } else {
        showToast(data.error || 'Failed to add admin.')
      }
    } catch {
      showToast('Failed to add admin.')
    }
    setAddLoading(false)
  }

  // Delete admin
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a._id !== id))
        showToast('Admin deleted.')
      } else {
        showToast(data.error || 'Failed to delete admin.')
      }
    } catch {
      showToast('Failed to delete admin.')
    }
    setDeleteTarget(null)
  }

  // Change password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPw || !confirmPw) {
      showToast('All password fields are required.')
      return
    }
    if (newPw !== confirmPw) {
      showToast('New passwords do not match.')
      return
    }
    if (newPw.length < 6) {
      showToast('New password must be at least 6 characters.')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/admin/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword: newPw }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentPassword('')
        setNewPw('')
        setConfirmPw('')
        showToast('Password changed successfully. Use new password on next login.')
      } else {
        showToast(data.error || 'Failed to change password.')
      }
    } catch {
      showToast('Failed to change password.')
    }
    setPwLoading(false)
  }

  const currentAdminId = (session as any)?.adminId

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--forest-green)' }}>
          Admin Users
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Manage admin accounts, add new admins, or change your password
        </p>
      </div>

      {/* Admin Users Table */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
            Admin Accounts ({admins.length})
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={btnStyle(
              showAddForm ? 'transparent' : 'var(--forest-green)',
              showAddForm ? 'var(--text-muted)' : '#fff',
              showAddForm ? '1px solid #ddd8d0' : undefined,
            )}
          >
            {showAddForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <form onSubmit={handleAddAdmin} style={{
            background: 'var(--cream)', border: '1px solid #e8e6e0', borderRadius: '10px',
            padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" disabled={addLoading} style={btnStyle(addLoading ? '#8aaa8a' : 'var(--forest-green)', '#fff')}>
              {addLoading ? '⏳ Adding...' : '✓ Create Admin'}
            </button>
          </form>
        )}

        {/* Admin Users List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
            Loading...
          </div>
        ) : admins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '0.85rem' }}>
            No admin users found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)' }}>
              <thead>
                <tr style={{ background: '#f8f6f2', borderBottom: '1px solid #e8e6e0' }}>
                  {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem',
                      fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => {
                  const isYou = admin._id === currentAdminId
                  const isSuperAdmin = admin.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
                  const isLastAdmin = admins.length <= 1
                  const canDelete = !isYou && !isSuperAdmin && !isLastAdmin
                  return (
                    <tr key={admin._id} style={{ borderBottom: '1px solid #f0ede8' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Avatar circle */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: isSuperAdmin ? 'rgba(183, 149, 57, 0.15)' : 'rgba(45, 74, 45, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                            color: isSuperAdmin ? '#b79539' : 'var(--forest-green)',
                          }}>
                            {isSuperAdmin ? '👑' : admin.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{admin.name}</span>
                          {isYou && (
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 600, color: 'var(--forest-green)',
                              background: 'rgba(45,74,45,0.08)', padding: '2px 6px', borderRadius: '4px',
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>You</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {admin.email}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isSuperAdmin ? (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#b79539',
                            background: 'rgba(183, 149, 57, 0.1)', padding: '3px 8px', borderRadius: '4px',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>Super Admin</span>
                        ) : (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)',
                            background: 'rgba(0,0,0,0.04)', padding: '3px 8px', borderRadius: '4px',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>Admin</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {canDelete ? (
                          <button
                            onClick={() => setDeleteTarget(admin)}
                            style={btnStyle('transparent', '#c0392b', '1px solid #ffddd9')}
                          >
                            Delete
                          </button>
                        ) : (
                          <span style={{
                            fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)',
                            fontStyle: 'italic',
                          }}>
                            {isSuperAdmin ? 'Protected' : isYou ? 'Your account' : 'Last admin'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>🔒 Change Your Password</h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Update your own admin password. You&apos;ll need to use the new password on your next login.
        </p>

        <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                Current Password
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                New Password
              </label>
              <PasswordInput
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                Confirm New Password
              </label>
              <PasswordInput
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
              />
            </div>
          </div>
          <button type="submit" disabled={pwLoading} style={btnStyle(pwLoading ? '#8aaa8a' : 'var(--forest-green)', '#fff')}>
            {pwLoading ? '⏳ Updating...' : '🔑 Change Password'}
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '2rem',
            maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
              Delete Admin?
            </h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) as an admin? They will no longer be able to access the dashboard.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={btnStyle('transparent', 'var(--text-muted)', '1px solid #ddd8d0')}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget._id)}
                style={btnStyle('#c0392b', '#fff')}
              >
                Delete Admin
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
