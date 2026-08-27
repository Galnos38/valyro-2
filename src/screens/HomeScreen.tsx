import { useState, useRef, useEffect } from 'react';
import { Camera, Link2, Search, ScanLine, ChevronRight, Sparkles, Lock } from 'lucide-react';
import { sampleProducts, categoryLabels } from '@/lib/products';
import type { Category } from '@/types';
import { InputSheet, type InputMode } from '@/components/InputSheet';

interface HomeScreenProps {
  onAnalyze: (query: string) => void;
  onAnalyzeProduct: (productName: string, price: number) => void;
  onQuickAnalyze: (productId: string) => void;
}

const inputMethods: { icon: typeof Camera; label: string; desc: string; mode: InputMode }[] = [
  { icon: Camera, label: 'Prendre en photo', desc: 'Identifiez le produit instantanément', mode: 'photo' },
  { icon: ScanLine, label: 'Scanner une annonce', desc: 'Importez une annonce existante', mode: 'scan' },
  { icon: Link2, label: 'Coller un lien', desc: 'Analysez depuis une URL', mode: 'link' },
  { icon: Search, label: 'Rechercher', desc: 'Trouvez par mots-clés', mode: 'search' },
];

export function HomeScreen({ onAnalyze, onAnalyzeProduct, onQuickAnalyze }: HomeScreenProps) {
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<InputMode>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onAnalyze(query.trim());
  };

  const handleMethodClick = (mode: InputMode) => {
    if (mode === 'search') {
      setActiveMode('search');
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      setActiveMode(mode);
    }
  };

  const handleSheetSubmit = (productName: string, price: number) => {
    setActiveMode(null);
    onAnalyzeProduct(productName, price);
  };

  // Close sheet on Escape
  useEffect(() => {
    if (!activeMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMode(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeMode]);

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-12 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Valeur</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">
            Achetez malin.<br />
            <span className="text-emerald-400">Ne payez jamais trop cher.</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Prenez en photo, scannez, collez un lien ou recherchez un produit.
            Valeur analyse l'offre et vous dit si c'est une bonne affaire en quelques secondes.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Essayez: iPhone 13 Pro 549€, Ford Focus 12500€..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-11 pr-24 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition active:scale-95"
          >
            Analyser
          </button>
        </form>
      </div>

      {/* Input methods */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {inputMethods.map((m) => (
            <button
              key={m.label}
              onClick={() => handleMethodClick(m.mode)}
              className="flex flex-col items-start gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-left hover:border-emerald-500/30 hover:bg-slate-800 transition active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center">
                <m.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{m.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick analyze */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Analyser un exemple</h2>
          <span className="text-[11px] text-slate-500">Touchez pour tester</span>
        </div>
        <div className="space-y-2.5">
          {sampleProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => onQuickAnalyze(p.id)}
              className="w-full flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-2.5 text-left hover:border-emerald-500/30 transition active:scale-[0.98] group"
            >
              <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 font-semibold">
                    {p.askPrice.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                    {categoryLabels[p.category as Category]}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Premium banner */}
      <div className="px-5 mt-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-emerald-600/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-100">Passez à Valeur Premium</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyses illimitées, alertes personnalisées et historique avancé.
              </p>
            </div>
          </div>
          <button className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold py-2.5 rounded-xl transition active:scale-95">
            Découvrir Premium — 4,99 €/mois
          </button>
        </div>
      </div>

      <InputSheet
        mode={activeMode}
        onClose={() => setActiveMode(null)}
        onSubmit={handleSheetSubmit}
      />
    </div>
  );
}
