import { useState, useRef, useEffect } from 'react';
import { X, Camera, ScanLine, Link2, Search, Image as ImageIcon, Loader2, Check } from 'lucide-react';

export type InputMode = 'photo' | 'scan' | 'link' | 'search' | null;

interface InputSheetProps {
  mode: InputMode;
  onClose: () => void;
  onSubmit: (productName: string, price: number) => void;
}

const modeConfig: Record<Exclude<InputMode, null>, { icon: typeof Camera; title: string; subtitle: string }> = {
  photo: { icon: Camera, title: 'Prendre en photo', subtitle: 'Photographiez le produit pour l\'identifier' },
  scan: { icon: ScanLine, title: 'Scanner une annonce', subtitle: 'Importez une capture d\'annonce' },
  link: { icon: Link2, title: 'Coller un lien', subtitle: 'Analysez depuis une URL' },
  search: { icon: Search, title: 'Rechercher', subtitle: 'Trouvez par mots-clés' },
};

export function InputSheet({ mode, onClose, onSubmit }: InputSheetProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'photo' && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
    if (mode === 'scan' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === null) {
      setImagePreview(null);
      setProductName('');
      setPrice('');
      setLinkUrl('');
      setScanning(false);
      setError('');
    }
  }, [mode]);

  if (!mode) return null;

  const config = modeConfig[mode];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onClose();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        if (mode === 'photo') {
          setProductName('Produit détecté — complétez les détails');
        } else {
          setProductName('Annonce importée — complétez les détails');
        }
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const guessFromUrl = (url: string): { name: string; price: number | null } => {
    const lower = url.toLowerCase();
    let name = 'Produit';
    if (lower.includes('iphone')) name = 'iPhone';
    else if (lower.includes('samsung') || lower.includes('galaxy')) name = 'Samsung Galaxy';
    else if (lower.includes('ford') || lower.includes('peugeot') || lower.includes('renault') || lower.includes('volkswagen') || lower.includes('vw')) {
      name = url.match(/(?:ford|peugeot|renault|volkswagen|vw)[\w-]*/i)?.[0] ?? 'Voiture occasion';
    }
    else if (lower.includes('macbook') || lower.includes('laptop')) name = 'Ordinateur portable';
    else if (lower.includes('ps4') || lower.includes('ps5') || lower.includes('playstation')) name = 'Console PlayStation';
    else if (lower.includes('canape') || lower.includes('sofa')) name = 'Canapé';
    const priceMatch = url.match(/(\d[\d\s.,]*)\s*(?:€|eur)/i);
    let price: number | null = null;
    if (priceMatch) {
      const p = parseFloat(priceMatch[1].replace(/[.\s]/g, '').replace(',', '.'));
      if (!isNaN(p) && p > 10) price = p;
    }
    return { name, price };
  };

  const handleLinkAnalyze = () => {
    if (!linkUrl.trim()) {
      setError('Collez un lien d\'annonce.');
      return;
    }
    setScanning(true);
    setError('');
    setTimeout(() => {
      const guess = guessFromUrl(linkUrl);
      setProductName(guess.name);
      if (guess.price) setPrice(String(guess.price));
      setScanning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    const p = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!productName.trim()) {
      setError('Indiquez le nom du produit.');
      return;
    }
    if (isNaN(p) || p <= 0) {
      setError('Indiquez un prix valide.');
      return;
    }
    onSubmit(productName.trim(), p);
  };

  const showForm = mode === 'search' || (mode === 'link' && productName !== '') || ((mode === 'photo' || mode === 'scan') && !scanning);

  return (
    <>
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-[70] max-w-md mx-auto animate-slide-up">
        <div className="bg-slate-900 border-t border-slate-700/50 rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto no-scrollbar">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <config.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">{config.title}</p>
                <p className="text-xs text-slate-500">{config.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center active:scale-90 transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="px-5 space-y-4">
            {/* Photo / Scan: image preview or upload prompt */}
            {(mode === 'photo' || mode === 'scan') && (
              <>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Capture" className="w-full h-48 object-cover" />
                    {scanning && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                        <p className="text-xs text-slate-200">
                          {mode === 'photo' ? 'Identification du produit...' : 'Lecture de l\'annonce...'}
                        </p>
                      </div>
                    )}
                    {!scanning && (
                      <button
                        onClick={() => { setImagePreview(null); setProductName(''); setPrice('');
                          (mode === 'photo' ? cameraInputRef : fileInputRef).current?.click(); }}
                        className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-xs text-slate-200 px-3 py-1.5 rounded-lg active:scale-95"
                      >
                        Refaire
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => (mode === 'photo' ? cameraInputRef : fileInputRef).current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-700 rounded-2xl py-10 hover:border-emerald-500/30 transition active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                      {mode === 'photo' ? <Camera className="w-6 h-6 text-emerald-400" /> : <ImageIcon className="w-6 h-6 text-emerald-400" />}
                    </div>
                    <p className="text-sm text-slate-400">
                      {mode === 'photo' ? 'Ouvrir l\'appareil photo' : 'Choisir une image'}
                    </p>
                  </button>
                )}
              </>
            )}

            {/* Link: URL input */}
            {mode === 'link' && (
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Lien de l'annonce</label>
                <div className="flex gap-2">
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://leboncoin.fr/..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                  <button
                    onClick={handleLinkAnalyze}
                    disabled={scanning}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold px-4 rounded-xl transition active:scale-95 flex items-center gap-1.5"
                  >
                    {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {scanning ? '...' : 'OK'}
                  </button>
                </div>
              </div>
            )}

            {/* Product details form (shown for all modes once we have something to work with) */}
            {showForm && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Nom du produit</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: iPhone 13 Pro 256 Go"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Prix demandé (€)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    inputMode="numeric"
                    placeholder="Ex: 549"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold py-3 rounded-xl transition active:scale-95"
                >
                  Analyser l'offre
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
