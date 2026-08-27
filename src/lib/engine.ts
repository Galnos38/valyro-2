import type { Analysis, AnalysisOrigin, Estimability } from '@/types';
import { sampleProducts, type SampleProduct } from './products';
import { fetchMarketData, type ProductQuery } from './sources';
import type { MarketData } from './sources/types';

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO ENGINE — fictional data, clearly separated from real data.
//  These functions produce analyses tagged with origin.kind = 'demo'.
//  They must NEVER be used as a source of market data.
// ═══════════════════════════════════════════════════════════════════════════

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildPriceHistory(basePrice: number, months: number, rng: () => number) {
  const points: { date: string; price: number }[] = [];
  let current = basePrice * 1.18;
  for (let i = months; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const drift = -0.012 + (rng() - 0.5) * 0.06;
    current = Math.max(current * (1 + drift), basePrice * 0.7);
    points.push({ date: d.toISOString().slice(0, 7), price: Math.round(current) });
  }
  points[points.length - 1].price = basePrice;
  return points;
}

function buildFactors(category: string, askPrice: number, marketAverage: number) {
  const cheaper = askPrice < marketAverage;
  return [
    {
      label: 'Prix vs marché',
      detail: cheaper
        ? `${Math.round(((marketAverage - askPrice) / marketAverage) * 100)}% moins cher que la moyenne du marché.`
        : `${Math.round(((askPrice - marketAverage) / marketAverage) * 100)}% plus cher que la moyenne du marché.`,
      impact: (cheaper ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: 'TrendingDown',
    },
    {
      label: 'État estimé',
      detail: category === 'cars'
        ? 'Carrosserie en bon état, intérieur propre, pas de rayures profondes.'
        : 'État général très bon, traces d\'usage minimes.',
      impact: 'positive' as const,
      icon: 'Sparkles',
    },
    {
      label: 'Âge & obsolescence',
      detail: category === 'phones'
        ? 'Modèle sorti il y a 3 ans, encore mis à jour mais proche de la fin du support logiciel.'
        : category === 'computers'
        ? 'Processeur de 2020, encore performant pour les usages courants.'
        : 'Âge raisonnable, pas de génération remplaçante imminente.',
      impact: 'neutral' as const,
      icon: 'Clock',
    },
    {
      label: 'Disponibilité',
      detail: 'Offre rare dans cette zone géographique, peu d\'annonces concurrentes.',
      impact: 'positive' as const,
      icon: 'MapPin',
    },
    {
      label: 'Frais futurs probables',
      detail: category === 'cars'
        ? 'Entretien des 100 000 km à prévoir (distribution, freins): ~600-900€.'
        : category === 'consoles'
        ? 'Manettes d\'origine usées, remplacement probable sous 1 an: ~50€.'
        : 'Pas de frais notables anticipés.',
      impact: (category === 'cars' || category === 'consoles' ? 'negative' : 'neutral') as 'negative' | 'neutral',
      icon: 'Wallet',
    },
    {
      label: 'Popularité & revente',
      detail: 'Forte demande sur ce modèle, bonne valeur de revente estimée.',
      impact: 'positive' as const,
      icon: 'BarChart3',
    },
  ];
}

function buildComparablesList(marketAverage: number, rng: () => number) {
  const sources = ['Leboncoin', 'eBay', 'Vinted', 'Facebook', 'La Centrale'];
  const conditions = ['Neuf', 'Très bon état', 'Bon état', 'État correct'];
  const list = [];
  for (let i = 0; i < 4; i++) {
    const variance = (rng() - 0.45) * 0.3;
    list.push({
      title: `Offre similaire #${i + 1}`,
      price: Math.round(marketAverage * (1 + variance)),
      condition: conditions[Math.floor(rng() * conditions.length)],
      location: ['Paris', 'Lyon', 'Bordeaux', 'Lille', 'Marseille'][Math.floor(rng() * 5)],
      source: sources[Math.floor(rng() * sources.length)],
    });
  }
  return list.sort((a, b) => a.price - b.price);
}

function buildNegotiation(title: string, maxRecommended: number, marketAverage: number): string {
  const offer = Math.round(Math.min(maxRecommended, marketAverage * 0.95));
  return `Bonjour,\n\nJe suis très intéressé(e) par "${title}" et je suis prêt(e) à concrétiser l'achat rapidement.\n\nAprès comparaison de plusieurs annonces similaires, le prix moyen constaté se situe autour de ${marketAverage.toLocaleString('fr-FR')} €. Compte tenu de l'état et du marché actuel, je vous propose ${offer.toLocaleString('fr-FR')} € pour un achat immédiat, paiement sécurisé et reprise rapide.\n\nRestant à votre disposition pour organiser une visite si nécessaire.\n\nCordialement.`;
}

function buildDemoAnalysis(product: SampleProduct): Analysis {
  const seed = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137;
  const rng = seededRandom(seed);

  const marketAverage = Math.round(product.askPrice * (1 + (rng() - 0.3) * 0.25));
  const priceLow = Math.round(marketAverage * 0.88);
  const priceHigh = Math.round(marketAverage * 1.12);
  const maxRecommended = Math.round(marketAverage * 1.02);

  const priceDiff = (marketAverage - product.askPrice) / marketAverage;
  const baseScore = 50 + priceDiff * 120;
  const score = Math.max(8, Math.min(98, Math.round(baseScore + (rng() - 0.5) * 8)));

  let verdict: string;
  if (score >= 85) verdict = 'Excellente affaire';
  else if (score >= 70) verdict = 'Très bonne affaire';
  else if (score >= 55) verdict = 'Bonne affaire';
  else if (score >= 40) verdict = 'Prix correct';
  else if (score >= 25) verdict = 'Prix élevé';
  else verdict = 'Mauvaise affaire';

  const origin: AnalysisOrigin = { kind: 'demo' };

  return {
    id: `${product.id}-${Date.now()}`,
    title: product.title,
    category: product.category,
    image: product.image,
    askPrice: product.askPrice,
    score,
    verdict,
    marketAverage,
    priceLow,
    priceHigh,
    maxRecommended,
    priceHistory: buildPriceHistory(product.askPrice, 8, rng),
    factors: buildFactors(product.category, product.askPrice, marketAverage),
    comparables: buildComparablesList(marketAverage, rng),
    negotiationMessage: buildNegotiation(product.title, maxRecommended, marketAverage),
    createdAt: Date.now(),
    origin,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  REAL ENGINE — uses verified data from registered sources.
//  Currently always returns 'impossible' because no source is connected.
// ═══════════════════════════════════════════════════════════════════════════

function buildImpossibleAnalysis(query: ProductQuery, reason: string): Analysis {
  return {
    id: `impossible-${Date.now()}`,
    title: query.rawText || 'Produit inconnu',
    category: 'phones',
    image: '',
    askPrice: query.askPrice ?? 0,
    score: 0,
    verdict: 'Estimation impossible',
    marketAverage: 0,
    priceLow: 0,
    priceHigh: 0,
    maxRecommended: 0,
    priceHistory: [],
    factors: [],
    comparables: [],
    negotiationMessage: '',
    createdAt: Date.now(),
    origin: { kind: 'impossible', reason },
  };
}

function buildRealAnalysis(
  query: ProductQuery,
  market: MarketData,
  estimability: Estimability
): Analysis {
  const avg = market.averagePrice.value ?? 0;
  const low = market.lowestPrice.value ?? 0;
  const high = market.highestPrice.value ?? 0;
  const askPrice = query.askPrice ?? 0;

  // Score is only computed when we have enough verified data.
  let score = 0;
  let verdict = 'Données insuffisantes';

  if (estimability === 'estimable' && avg > 0 && askPrice > 0) {
    const priceDiff = (avg - askPrice) / avg;
    score = Math.max(0, Math.min(100, Math.round(50 + priceDiff * 120)));
    if (score >= 85) verdict = 'Excellente affaire';
    else if (score >= 70) verdict = 'Très bonne affaire';
    else if (score >= 55) verdict = 'Bonne affaire';
    else if (score >= 40) verdict = 'Prix correct';
    else if (score >= 25) verdict = 'Prix élevé';
    else verdict = 'Mauvaise affaire';
  }

  const maxRecommended = avg > 0 ? Math.round(avg * 1.02) : 0;

  return {
    id: `real-${Date.now()}`,
    title: query.rawText,
    category: 'phones',
    image: '',
    askPrice,
    score,
    verdict,
    marketAverage: avg,
    priceLow: low,
    priceHigh: high,
    maxRecommended,
    priceHistory: [],
    factors: [],
    comparables: [],
    negotiationMessage: '',
    createdAt: Date.now(),
    origin: {
      kind: 'real',
      estimability,
      sources: market.sources,
    },
  };
}

/**
 * Run a real analysis using registered sources.
 * Returns an 'impossible' analysis if no verified data is available.
 */
export async function analyzeReal(query: ProductQuery): Promise<Analysis> {
  const market = await fetchMarketData(query);

  if (market.estimability === 'impossible') {
    return buildImpossibleAnalysis(query, market.reason ?? 'Aucune donnée vérifiable disponible.');
  }

  return buildRealAnalysis(query, market, market.estimability);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC API — backward-compatible entry points.
//  The demo path stays for now; the real path is ready but returns
//  'impossible' until sources are connected.
// ═══════════════════════════════════════════════════════════════════════════

export function analyzeProduct(product: SampleProduct): Analysis {
  return buildDemoAnalysis(product);
}

export function analyzeFromText(query: string): Analysis {
  const lower = query.toLowerCase();
  let product = sampleProducts[0];
  if (lower.includes('iphone') || lower.includes('phone') || lower.includes('téléphone'))
    product = sampleProducts[1];
  else if (lower.includes('mac') || lower.includes('laptop') || lower.includes('pc'))
    product = sampleProducts[2];
  else if (lower.includes('ps') || lower.includes('console') || lower.includes('jeu'))
    product = sampleProducts[3];
  else if (lower.includes('canapé') || lower.includes('meuble') || lower.includes('sofa'))
    product = sampleProducts[4];
  else if (lower.includes('voiture') || lower.includes('auto') || lower.includes('ford'))
    product = sampleProducts[0];

  const priceMatch = query.match(/(\d[\d\s.,]*)\s*€?/);
  if (priceMatch) {
    const price = parseFloat(priceMatch[1].replace(/[.\s]/g, '').replace(',', '.'));
    if (!isNaN(price) && price > 10) {
      product = { ...product, title: query.slice(0, 60), askPrice: price };
    }
  }
  return buildDemoAnalysis(product);
}

export { sampleProducts };
