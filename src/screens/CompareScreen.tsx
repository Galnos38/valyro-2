import { ArrowLeft, Scale, Plus, X } from 'lucide-react';
import type { Analysis } from '@/types';
import { ScoreGauge } from '@/components/ScoreGauge';

interface CompareScreenProps {
  analyses: Analysis[];
  onBack: () => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function CompareScreen({ analyses, onBack, onAdd, onRemove }: CompareScreenProps) {
  if (analyses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5">
        <Scale className="w-12 h-12 text-slate-600" />
        <p className="text-sm text-slate-400 text-center">
          Aucune offre à comparer pour l'instant.<br />
          Analysez une offre puis touchez « Comparer ».
        </p>
        <button onClick={onBack} className="text-sm text-emerald-400 font-semibold">
          Retour
        </button>
      </div>
    );
  }

  const best = analyses.reduce((a, b) => (a.score >= b.score ? a : b));

  return (
    <div className="pb-28 animate-fade-in">
      <div className="sticky top-0 z-10 glass border-b border-slate-800 px-5 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center active:scale-90 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">Comparer ({analyses.length})</h1>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5 pt-4 min-w-max">
          {analyses.map((a) => (
            <div
              key={a.id}
              className={`w-64 shrink-0 bg-slate-800/60 border rounded-2xl p-4 ${
                a.id === best.id ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <img src={a.image} alt={a.title} className="w-16 h-16 rounded-xl object-cover" />
                <button onClick={() => onRemove(a.id)} className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center active:scale-90">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
              <p className="text-xs font-medium text-slate-200 mt-2 line-clamp-2 h-8">{a.title}</p>
              <div className="flex justify-center my-3">
                <ScoreGauge score={a.score} size={100} />
              </div>
              <p className="text-center text-sm font-bold" style={{
                color: a.score >= 70 ? '#34d399' : a.score >= 40 ? '#f59e0b' : '#ef4444'
              }}>
                {a.verdict}
              </p>
              {a.id === best.id && (
                <p className="text-center text-[10px] text-emerald-400 font-semibold mt-1 bg-emerald-500/10 rounded-full py-1">
                  Meilleure affaire
                </p>
              )}

              <div className="mt-3 space-y-2 text-xs">
                <Row label="Prix demandé" value={`${a.askPrice.toLocaleString('fr-FR')} €`} highlight />
                <Row label="Moyenne marché" value={`${a.marketAverage.toLocaleString('fr-FR')} €`} />
                <Row label="Prix max conseillé" value={`${a.maxRecommended.toLocaleString('fr-FR')} €`} />
                <Row label="Prix bas" value={`${a.priceLow.toLocaleString('fr-FR')} €`} />
              </div>
            </div>
          ))}

          {analyses.length < 4 && (
            <button
              onClick={onAdd}
              className="w-64 shrink-0 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400 transition min-h-[300px]"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Ajouter une offre</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-sm font-semibold text-emerald-400">Recommandation</p>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            La meilleure affaire est « {best.title} » avec un score de {best.score}/100.
            {best.askPrice < best.marketAverage
              ? ` Son prix est ${Math.round((1 - best.askPrice / best.marketAverage) * 100)}% sous la moyenne du marché.`
              : ' Son prix est proche de la moyenne du marché.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? 'text-emerald-400 font-bold' : 'text-slate-300 font-medium'}>{value}</span>
    </div>
  );
}
