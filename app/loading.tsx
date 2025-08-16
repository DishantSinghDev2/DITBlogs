// app/layout.tsx
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color='#1faaff' />
        {children}
      </body>
    </html>
  )
}