// app/layout.js

import './globals.css';

export const metadata = {
  title: 'Inventário Logística',
  description: 'Aplicação para contagem de estoque',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        {/* O Navbar foi removido daqui! */}
        {children}
      </body>
    </html>
  );
}