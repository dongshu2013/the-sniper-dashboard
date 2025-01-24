import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthInit from '@/components/ui/auth-init';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Toaster />
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
