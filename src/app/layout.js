import './globals.css'

export const metadata = {
  title: 'Todo List App',
  description: 'A modern todo list application with Supabase integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}