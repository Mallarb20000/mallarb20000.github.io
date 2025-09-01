'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WritingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to root since we moved the writing interface there
    router.replace('/')
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div>
        <h1>IELTS Writing Analyzer</h1>
        <p>Redirecting to writing interface...</p>
      </div>
    </div>
  )
}