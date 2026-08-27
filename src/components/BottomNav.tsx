import { Home, Scale, Bell, History } from 'lucide-react';
import type { Screen } from '@/types';

interface BottomNavProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  alertCount: number;
}

const tabs: { screen: Screen; icon: typeof Home; label: string }[] = [
  { screen: 'home', icon: Home, label: 'Accueil' },
  { screen: 'compare', icon: Scale, label: 'Comparer' },
  { screen: 'alerts', icon: Bell, label: 'Alertes' },
  { screen: 'history', icon: History, label: 'Historique' },
];

export function BottomNav({ active, onNavigate, alertCount }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 glass border-t border-slate-800">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((t) => {
          const isActive = active === t.screen;
          return (
            <button
              key={t.screen}
              onClick={() => onNavigate(t.screen)}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 transition active:scale-90"
            >
              <div className="relative">
                <t.icon
                  className={`w-5 h-5 transition ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {t.screen === 'alerts' && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] transition ${isActive ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                {t.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
