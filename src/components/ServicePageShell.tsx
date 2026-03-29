import type { ReactNode } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

type AccentTone = 'cyan' | 'gold' | 'green';

interface ServiceHighlight {
  label: string;
  value: string;
}

interface ServicePageShellProps {
  accent?: AccentTone;
  badge: string;
  title: string;
  description: string;
  highlights: ServiceHighlight[];
  aside?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

const ACCENT_STYLES: Record<AccentTone, string> = {
  cyan: 'from-slate-950 via-slate-900 to-cyan-950',
  gold: 'from-amber-500 via-orange-500 to-red-600',
  green: 'from-slate-950 via-slate-900 to-emerald-950',
};

const CHIP_STYLES: Record<AccentTone, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-100 border-cyan-300/20',
  gold: 'bg-black/15 text-white border-white/20',
  green: 'bg-emerald-500/15 text-emerald-100 border-emerald-300/20',
};

export function ServicePageShell({
  accent = 'cyan',
  badge,
  title,
  description,
  highlights,
  aside,
  actions,
  children,
}: ServicePageShellProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(0,200,232,0.14),transparent_60%)]" />
      <div className="wasel-container page-pad relative space-y-6 md:space-y-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
          <Card className={`overflow-hidden border-0 bg-gradient-to-br ${ACCENT_STYLES[accent]} text-white shadow-xl`}>
            <CardContent className="flex h-full flex-col gap-5 p-6 md:p-8">
              <Badge className="w-fit bg-white/15 text-white hover:bg-white/15">
                {badge}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
                <p className="max-w-3xl text-sm leading-6 text-white/85 md:text-base">
                  {description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 text-sm">
                {highlights.map((highlight) => (
                  <div
                    key={`${highlight.label}-${highlight.value}`}
                    className={`rounded-full border px-3 py-1.5 ${CHIP_STYLES[accent]}`}
                  >
                    <span className="font-medium">{highlight.label}</span>
                    <span className="ml-2 opacity-90">{highlight.value}</span>
                  </div>
                ))}
              </div>
              {actions && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {actions}
                </div>
              )}
            </CardContent>
          </Card>

          {aside ? (
            <div className="grid gap-4">{aside}</div>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}
