import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Nostalgic Study',
  description: 'Quizlet-style study app for web and mobile.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
