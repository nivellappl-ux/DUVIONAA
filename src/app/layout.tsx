import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP Angola - Sistema de Gestão Empresarial',
  description: 'Sistema completo de gestão comercial, financeira e recursos humanos com conformidade AGT/INSS.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-AO" className={cn("antialiased h-full", "font-sans", geist.variable)}>
      <body className={cn(inter.className, 'h-full bg-gray-50 text-gray-900')}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
