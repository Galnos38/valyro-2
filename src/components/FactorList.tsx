import {
  TrendingDown,
  Sparkles,
  Clock,
  MapPin,
  Wallet,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { Factor } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  TrendingDown,
  Sparkles,
  Clock,
  MapPin,
  Wallet,
  BarChart3,
};

const impactStyles: Record<string, string> = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  negative: 'text-red-400 bg-red-500/10 border-red-500/20',
  neutral: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export function FactorList({ factors }: { factors: Factor[] }) {
  return (
    <div className="space-y-2.5">
      {factors.map((f, i) => {
        const Icon = iconMap[f.icon] ?? Sparkles;
        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl border p-3 ${impactStyles[f.impact]} animate-slide-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mt-0.5 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">{f.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
