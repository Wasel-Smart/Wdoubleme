import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function InstallPWA() {
  const [show, setShow] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Simple check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-10">
      <Card className="bg-primary text-primary-foreground shadow-xl border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <button onClick={() => setShow(false)} className="text-primary-foreground/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <CardContent className="p-4 pt-5">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-xl p-2 h-12 w-12 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xl">W</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold">Install Wasel App</h3>
              <p className="text-sm text-primary-foreground/90">
                For a better experience, install our app on your home screen.
              </p>
              
              {isIOS ? (
                <div className="text-xs bg-white/10 p-2 rounded mt-2 space-y-1">
                  <p className="flex items-center gap-2">1. Tap <Share className="h-3 w-3" /></p>
                  <p className="flex items-center gap-2">2. Select "Add to Home Screen" <PlusSquare className="h-3 w-3" /></p>
                </div>
              ) : (
                 <Button 
                    size="sm" 
                    className="mt-2 bg-white text-primary hover:bg-white/90 w-full"
                    onClick={() => alert("Tap the browser menu (⋮) and select 'Install App' or 'Add to Home Screen'")}
                 >
                    <Download className="h-4 w-4 mr-2" /> Install Now
                 </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}