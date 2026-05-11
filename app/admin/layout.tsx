'use client'

import { usePathname } from 'next/navigation'
import AdminShell from './AdminShell'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Login page renders without the nav shell
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
