import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
  Bell,
  Scale,
  Wallet,
  Info,
} from 'lucide-react';
import type { Analysis } from '@/types';
import { ScoreGauge } from '@/components/ScoreGauge';
import { PriceChart } from '@/components/PriceChart';
import { FactorList } from '@/components/FactorList';

interface AnalysisScreenProps {
  analysis: Analysis;
  onBack: () => void;
  onCompare: (analysis: Analysis) => void;
  onSetAlert: (analysis: Analysis) => void;
}

export function AnalysisScreen({ analysis, onBack, onCompare, onSetAlert }: AnalysisScreenProps) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(analysis.negotiationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">Analyse en cours...</p>
          <p className="text-xs text-slate-500 mt-1">
            Comparaison des prix, état, historique et disponibilité
          </p>
        </div>
        <div className="w-64 space-y-2">
          {['Prix du marché', 'Historique des prix', 'État & caractéristiques', 'Calcul du score'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-400 animate-slide-up" style={{ animationDelay: `${i * 300}ms` }}>
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 animate-fade-in">
      {/* Header image */}
      <div className="relative h-48 overflow-hidden">
        <img src={analysis.image} alt={analysis.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl glass border border-slate-700/50 flex items-center justify-center active:scale-90 transition"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Title + score */}
      <div className="px-5 -mt-8 relative">
        <h1 className="text-lg font-bold leading-snug text-white">{analysis.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-emerald-400">
            {analysis.askPrice.toLocaleString('fr-FR')} €
          </span>
        </div>
      </div>

      {/* Score card */}
      <div className="px-5 mt-5">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center animate-scale-in">
          <ScoreGauge score={analysis.score} />
          <p className="text-lg font-bold mt-2" style={{
            color: analysis.score >= 70 ? '#34d399' : analysis.score >= 40 ? '#f59e0b' : '#ef4444'
          }}>
            {analysis.verdict}
          </p>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Score calculé à partir du prix, de l'état, de l'âge et de la disponibilité
          </p>
        </div>
      </div>

      {/* Price range */}
      <div className="px-5 mt-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-200">Estimation de prix</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="relative h-2 bg-slate-700/50 rounded-full">
            <div className="absolute h-full bg-gradient-to-r from-emerald-500/40 via-emerald-500/60 to-amber-500/40 rounded-full"
              style={{ left: '15%', right: '15%' }} />
            <div className="absolute w-3 h-3 -mt-0.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shadow-lg"
              style={{ left: 'calc(50% - 6px)' }} />
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <div>
              <p className="text-slate-500">Prix bas</p>
              <p className="text-slate-300 font-semibold">{analysis.priceLow.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Moyenne marché</p>
              <p className="text-slate-200 font-semibold">{analysis.marketAverage.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Prix haut</p>
              <p className="text-slate-300 font-semibold">{analysis.priceHigh.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Prix maximum conseillé</p>
              <p className="text-sm font-bold text-amber-400">{analysis.maxRecommended.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Votre offre</p>
              <p className="text-sm font-bold text-emerald-400">{analysis.askPrice.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price history */}
      <div className="px-5 mt-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-200">Historique des prix</span>
          </div>
          <PriceChart data={analysis.priceHistory} currentPrice={analysis.askPrice} />
          <p className="text-xs text-slate-500 mt-2">
            {analysis.askPrice < analysis.priceHistory[0].price
              ? `Actuellement ${Math.round((1 - analysis.askPrice / analysis.priceHistory[0].price) * 100)}% moins cher que son pic. Bon moment pour acheter.`
              : "Le prix est actuellement dans la moyenne haute. Il pourrait être préférable d'attendre."}
          </p>
        </div>
      </div>

      {/* Factors */}
      <div className="px-5 mt-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Facteurs analysés</h2>
        <FactorList factors={analysis.factors} />
      </div>

      {/* Comparables */}
      <div className="px-5 mt-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Offres similaires</h2>
        <div className="space-y-2">
          {analysis.comparables.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-slate-200">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {c.condition} · {c.location} · {c.source}
                </p>
              </div>
              <span className={`text-sm font-bold ${c.price < analysis.askPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                {c.price.toLocaleString('fr-FR')} €
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiate */}
      <div className="px-5 mt-4">
        {showNegotiate ? (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-200">Message de négociation</span>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-emerald-400 active:scale-95">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
              {analysis.negotiationMessage}
            </pre>
          </div>
        ) : (
          <button
            onClick={() => setShowNegotiate(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3.5 rounded-2xl transition active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            Négocier — générer un message
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={() => onCompare(analysis)}
          className="flex items-center justify-center gap-2 bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 text-slate-200 font-medium py-3 rounded-2xl transition active:scale-95"
        >
          <Scale className="w-4 h-4" />
          Comparer
        </button>
        <button
          onClick={() => onSetAlert(analysis)}
          className="flex items-center justify-center gap-2 bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 text-slate-200 font-medium py-3 rounded-2xl transition active:scale-95"
        >
          <Bell className="w-4 h-4" />
          Alerte
        </button>
      </div>

      {/* Future costs note */}
      <div className="px-5 mt-4">
        <div className="flex items-start gap-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
          <Wallet className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Valeur anticipe les frais futurs probables (entretien, réparations, consommables) et les
            intègre au score pour vous donner une image réelle du coût total.
          </p>
        </div>
      </div>
    </div>
  );
}
