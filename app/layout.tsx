import './globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
