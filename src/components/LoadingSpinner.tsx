import logoImage from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

interface LoadingSpinnerProps {
  compact?: boolean;
}

export function LoadingSpinner({ compact = false }: LoadingSpinnerProps) {
  const content = (
    <>
      <div className="relative flex-shrink-0" aria-hidden="true">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary absolute -inset-0" />
        <div
          className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(4,173,191,0.08)', border: '1px solid rgba(4,173,191,0.15)' }}
        >
          <img
            src={logoImage}
            alt="Wasel"
            className="w-12 h-12 object-contain"
            loading="eager"
          />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
        Loading Wasel...
      </p>
    </>
  );

  if (compact) {
    return (
      <div
        className="flex flex-col items-center justify-center py-8"
        role="status"
        aria-label="Loading"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
