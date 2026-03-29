import { ReactNode } from 'react';
import { Logo } from '../Logo';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function LegalLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <button type="button" onClick={() => navigate('/')} className="mr-6 flex items-center space-x-2">
            <Logo size="sm" rolling={true} />
          </button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Wasel Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <button type="button" onClick={() => navigate('/privacy')} className="hover:underline transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => navigate('/terms')} className="hover:underline transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}