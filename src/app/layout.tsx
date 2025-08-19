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
    <html lang="en" data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                  const theme = isDark ? 'dark' : 'light';
                  
                  // Apply theme immediately with all selectors
                  document.documentElement.setAttribute('data-theme', theme);
                  document.body.className = isDark ? 'dark-mode' : 'light-mode';
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.add('dark-mode');
                    document.documentElement.style.setProperty('--bg-primary', '#1a1b23');
                    document.documentElement.style.setProperty('--color-primary', '#ffffff');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.remove('dark-mode');
                    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
                    document.documentElement.style.setProperty('--color-primary', '#1a1a1a');
                  }
                  
                  console.log('Initial theme set:', theme, 'isDark:', isDark);
                } catch (e) {
                  console.error('Theme initialization error:', e);
                  // Fallback to light theme
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}