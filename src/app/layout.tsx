import './writing/globals.css'

export const metadata = {
  title: 'IELTS Writing Analyzer',
  description: 'AI-powered IELTS Writing Task 2 analysis and feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}