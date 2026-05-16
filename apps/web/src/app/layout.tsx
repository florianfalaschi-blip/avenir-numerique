import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Les métadonnées seront surchargées par tenant dans chaque page
export const metadata: Metadata = {
  title: {
    template: '%s | Imprimerie en ligne',
    default: 'Imprimerie en ligne',
  },
  description: 'Impression professionnelle en ligne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
