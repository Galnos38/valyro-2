/**
 * Source registry for Valyro.
 *
 * This module is the single entry point for retrieving real market data.
 * Sources are registered here and will be implemented in future steps.
 * For now the registry is empty — `fetchMarketData` always returns
 * `impossible` because no real source is connected yet.
 *
 * IMPORTANT: this module must NEVER fabricate data. If no source is
 * available, it returns an estimability of `impossible`.
 */

import type { Estimability, SourcedDatum, RealOffer, SourcedPricePoint } from '@/types';
import { unknown } from '@/types';
import type { PriceSource, ProductQuery, MarketData, SourceResult } from './types';

export type { PriceSource, ProductQuery, MarketData, SourceResult } from './types';

// ─── Registry ────────────────────────────────────────────────────────────

/**
 * Registered price sources. Currently empty.
 * Future steps will push real source implementations here.
 */
const registry: PriceSource[] = [];

/**
 * Register a data source. Called by source modules when they are ready.
 */
export function registerSource(source: PriceSource): void {
  if (registry.some((s) => s.id === source.id)) return;
  registry.push(source);
}

/**
 * List all registered sources (for debugging / display).
 */
export function listSources(): ReadonlyArray<PriceSource> {
  return registry;
}

// ─── Market data retrieval ───────────────────────────────────────────────

/**
 * Query all registered sources for real offers matching `query`.
 * Aggregates the results into a MarketData object.
 *
 * If no sources are registered, or all sources return no results,
 * the returned MarketData has `estimability: 'impossible'` and every
 * SourcedDatum is `unknown()`.
 *
 * This function NEVER generates or fabricates data.
 */
export async function fetchMarketData(query: ProductQuery): Promise<MarketData> {
  if (registry.length === 0) {
    return emptyMarketData('Aucune source de données réelle n’est encore connectée.');
  }

  const allOffers: RealOffer[] = [];
  const sourceNames: string[] = [];

  for (const source of registry) {
    if (!source.categories.includes(query.model ? 'phones' : 'phones')) {
      // Sources are category-scoped; for now we only target phones.
      // This guard will be refined as more categories are added.
    }
    const result = await source.fetchOffers(query);
    if (result.status === 'ok' && result.offers.length > 0) {
      allOffers.push(...result.offers);
      sourceNames.push(source.label);
    }
  }

  if (allOffers.length === 0) {
    return emptyMarketData('Aucune offre vérifiable trouvée pour ce produit.');
  }

  const prices = allOffers
    .map((o) => o.price.value)
    .filter((p): p is number => p !== null);

  if (prices.length === 0) {
    return emptyMarketData('Les offres trouvées ne contiennent pas de prix exploitable.');
  }

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    offers: allOffers,
    averagePrice: {
      value: Math.round(avg),
      confidence: 'verified',
      source: sourceNames.join(', '),
      sourceUrl: null,
      retrievedAt: new Date().toISOString(),
    },
    lowestPrice: {
      value: min,
      confidence: 'verified',
      source: sourceNames.join(', '),
      sourceUrl: null,
      retrievedAt: new Date().toISOString(),
    },
    highestPrice: {
      value: max,
      confidence: 'verified',
      source: sourceNames.join(', '),
      sourceUrl: null,
      retrievedAt: new Date().toISOString(),
    },
    offerCount: {
      value: prices.length,
      confidence: 'verified',
      source: sourceNames.join(', '),
      sourceUrl: null,
      retrievedAt: new Date().toISOString(),
    },
    priceHistory: [] as SourcedPricePoint[],
    estimability: determineEstimability(prices.length),
    sources: sourceNames,
    reason: null,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function determineEstimability(offerCount: number): Estimability {
  if (offerCount >= 5) return 'estimable';
  if (offerCount >= 1) return 'insufficient';
  return 'impossible';
}

function emptyMarketData(reason: string): MarketData {
  const u = <T>(): SourcedDatum<T> => unknown<T>();
  return {
    offers: [],
    averagePrice: u<number>(),
    lowestPrice: u<number>(),
    highestPrice: u<number>(),
    offerCount: u<number>(),
    priceHistory: [],
    estimability: 'impossible',
    sources: [],
    reason,
  };
}
