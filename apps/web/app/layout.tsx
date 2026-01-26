import './globals.css';
import type { ReactNode } from 'react';
import UserBadge from './components/UserBadge';

export const metadata = {
  title: 'Nostalgic Study',
  description: 'Quizlet-style study app for web and mobile.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px' }}>
          <UserBadge />
        </div>
        {children}
      </body>
    </html>
  );
}
