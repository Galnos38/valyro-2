/**
 * Source-layer types for Valyro.
 *
 * This file defines the contracts that every future real data source
 * (Leboncoin, BackMarket, eBay, Apple Refurbished, etc.) must implement.
 * No implementations here — only interfaces and shared types.
 */

import type {
  SourcedDatum,
  RealOffer,
  SourcedPricePoint,
  Estimability,
  Confidence,
  Condition,
  Currency,
} from '@/types';

// Re-export for convenience so source implementations can import from one place.
export type { SourcedDatum, RealOffer, SourcedPricePoint, Estimability, Confidence, Condition, Currency };

// ─── Query: what the user is looking for ─────────────────────────────────

/**
 * A parsed product query — the input to the source layer.
 * Produced from user text, a link, or a photo (future).
 * Every field is optional because we may have partial information.
 */
export interface ProductQuery {
  /** Raw text the user entered. */
  rawText: string;
  /** Detected brand (e.g. "Apple"). */
  brand: string | null;
  /** Detected model (e.g. "iPhone 13 Pro"). */
  model: string | null;
  /** Detected capacity (e.g. "256 Go"). */
  capacity: string | null;
  /** Detected condition. */
  condition: Condition | null;
  /** Price asked by the seller, when known. */
  askPrice: number | null;
  /** Currency of the asked price. */
  currency: Currency | null;
  /** Original URL the user pasted, when applicable. */
  sourceUrl: string | null;
}

// ─── Source result: what a source returns ───────────────────────────────

/**
 * The outcome of querying a single source.
 * Either we got real offers, or we got nothing (with a reason).
 */
export type SourceResult =
  | { status: 'ok'; offers: RealOffer[] }
  | { status: 'no-results'; reason: string }
  | { status: 'error'; reason: string };

// ─── Source definition: the contract every source must implement ─────────

/**
 * A data source that can provide real, verifiable offers for a product query.
 * Each source is responsible for its own retrieval and must never fabricate
 * data — if a field is unavailable it must be returned as `unknown()`.
 */
export interface PriceSource {
  /** Unique identifier (e.g. "leboncoin", "backmarket"). */
  readonly id: string;
  /** Human-readable name (e.g. "Leboncoin"). */
  readonly label: string;
  /** Categories this source can cover (e.g. ["phones"]). */
  readonly categories: string[];
  /**
   * Query the source for real offers matching `query`.
   * Must never throw — errors are returned as `SourceResult`.
   */
  fetchOffers(query: ProductQuery): Promise<SourceResult>;
}

// ─── Aggregated market data ──────────────────────────────────────────────

/**
 * Aggregated, fully-sourced market data for a product.
 * Every numeric value is wrapped in a SourcedDatum so the engine can
 * decide whether enough verified data exists to produce an estimation.
 */
export interface MarketData {
  /** All real offers retrieved across sources. */
  offers: RealOffer[];
  /** Mean price across offers, or unknown if no offers. */
  averagePrice: SourcedDatum<number>;
  /** Lowest price found, or unknown. */
  lowestPrice: SourcedDatum<number>;
  /** Highest price found, or unknown. */
  highestPrice: SourcedDatum<number>;
  /** Number of offers used for the aggregate. */
  offerCount: SourcedDatum<number>;
  /** Historical price points, when available. Never generated. */
  priceHistory: SourcedPricePoint[];
  /** Whether we have enough data to estimate. */
  estimability: Estimability;
  /** Names of sources that contributed data. */
  sources: string[];
  /** Reason when estimability is not 'estimable'. */
  reason: string | null;
}
