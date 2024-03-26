import type { Metadata } from 'next'
import '../globals.css'

import { GeistSans } from 'geist/font/sans'

export const metadata: Metadata = {
  title: 'Server Action Docs'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} bg-slate-900 text-slate-50`}>{children}</body>
    </html>
  )
}
