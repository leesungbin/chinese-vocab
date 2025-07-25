import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: '중국어 단어 암기장',
  description: '중국어 단어 암기장',
  generator: 'Lee Seongbin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="beforeInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
