import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cure India - AI Medical Triage Assistant',
  description: 'AI-powered medical triage platform for symptom analysis, report interpretation, and doctor recommendations in India',
  keywords: 'medical triage, symptoms analysis, AI doctor, healthcare India, medical reports',
  authors: [{ name: 'Cure India Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background-primary text-text-primary">
          {children}
        </div>
      </body>
    </html>
  )
}