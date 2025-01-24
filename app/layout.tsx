import './globals.css';
import { Toaster } from 'sonner';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
