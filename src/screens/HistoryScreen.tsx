import { History, ChevronRight } from 'lucide-react';
import type { Analysis } from '@/types';

interface HistoryScreenProps {
  history: Analysis[];
  onSelect: (analysis: Analysis) => void;
}

export function HistoryScreen({ history, onSelect }: HistoryScreenProps) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Historique</h1>
        <p className="text-sm text-slate-400 mt-1">Vos analyses précédentes.</p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mt-20 px-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
            <History className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400 text-center">
            Aucune analyse pour l'instant.<br />
            Analysez votre premier produit pour le retrouver ici.
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-2.5">
          {history.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className="w-full flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 text-left hover:border-emerald-500/30 transition active:scale-[0.98] group"
            >
              <img src={a.image} alt={a.title} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{a.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{a.askPrice.toLocaleString('fr-FR')} €</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                    background: a.score >= 70 ? 'rgba(16,185,129,0.15)' : a.score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: a.score >= 70 ? '#34d399' : a.score >= 40 ? '#f59e0b' : '#ef4444',
                  }}>
                    {a.score}/100 · {a.verdict}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
