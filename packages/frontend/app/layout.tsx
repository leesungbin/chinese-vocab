import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HSK 4급 중국어 단어 암기',
  description: 'HSK 4급 중국어 단어 암기',
  generator: 'Lee Seongbin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
