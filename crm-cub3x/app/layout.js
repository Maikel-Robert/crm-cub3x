import './globals.css'

export const metadata = {
  title: 'CRM — cub3x',
  description: 'CRM de Prospecção cub3x',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
