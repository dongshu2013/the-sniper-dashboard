import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthInit from '@/components/ui/auth-init';
import { Navbar } from '@/components/shared/navbar';
import { TooltipProvider } from '@/components/ui/tooltip';

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
        <TooltipProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
