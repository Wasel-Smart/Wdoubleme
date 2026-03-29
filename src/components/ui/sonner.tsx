import type { CSSProperties } from 'react';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-[#0A1628] border-[#1E3A5F] text-white',
          title: 'text-white',
          description: 'text-slate-400',
          success: 'bg-[#00C875]/15 border-[#00C875]/35 text-[#00C875]',
          error: 'bg-red-900/20 border-red-800/40 text-red-400',
        },
      }}
      style={
        {
          "--normal-bg": "#0A1628",
          "--normal-text": "#F8FAFC",
          "--normal-border": "#1E3A5F",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
