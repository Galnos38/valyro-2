// ─── Categories & legacy demo types ──────────────────────────────────────

export type Category =
  | 'cars'
  | 'phones'
  | 'computers'
  | 'consoles'
  | 'furniture'
  | 'appliances';

// ─── Verified data infrastructure ──────────────────────────────────────

/**
 * Confidence level for a piece of data retrieved from an external source.
 * - `verified`   : the value comes directly from a trusted, checkable source.
 * - `estimated`  : the value is derived/inferred from verified data but not
 *                  stated verbatim by the source.
 * - `unknown`    : no source could provide this data point.
 */
export type Confidence = 'verified' | 'estimated' | 'unknown';

/**
 * A single piece of data that is traceable to an external source.
 * Wraps a value with enough metadata to audit where it came from.
 */
export interface SourcedDatum<T> {
  value: T | null;
  confidence: Confidence;
  /** Human-readable name of the source (e.g. "Leboncoin", "BackMarket"). */
  source: string | null;
  /** URL of the page or API endpoint the value was retrieved from, when available. */
  sourceUrl: string | null;
  /** ISO-8601 timestamp of when the value was retrieved. */
  retrievedAt: string | null;
}

/** Helper constructors — keep call sites readable and consistent. */
export function verified<T>(value: T, source: string, sourceUrl?: string): SourcedDatum<T> {
  return { value, confidence: 'verified', source, sourceUrl: sourceUrl ?? null, retrievedAt: new Date().toISOString() };
}
export function estimated<T>(value: T, source: string, sourceUrl?: string): SourcedDatum<T> {
  return { value, confidence: 'estimated', source, sourceUrl: sourceUrl ?? null, retrievedAt: new Date().toISOString() };
}
export function unknown<T>(): SourcedDatum<T> {
  return { value: null, confidence: 'unknown', source: null, sourceUrl: null, retrievedAt: null };
}

/**
 * Whether an estimation can actually be produced for a given product.
 * - `estimable`     : enough verified data exists to compute a score.
 * - `insufficient`  : some data exists but not enough to be reliable.
 * - `impossible`    : no verified source is available at all.
 */
export type Estimability = 'estimable' | 'insufficient' | 'impossible';

// ─── Real offer representation (for future iPhone sources) ────────────────

/** Physical condition of a second-hand item. */
export type Condition = 'new' | 'like-new' | 'very-good' | 'good' | 'fair' | 'poor' | 'unknown';

/** Currency in ISO-4217 format (e.g. "EUR", "USD"). */
export type Currency = string;

/**
 * A real, verifiable offer for a product — as opposed to a generated/fictional
 * comparable. Every field is a SourcedDatum so we can trace provenance.
 */
export interface RealOffer {
  /** Exact model name as stated by the source (e.g. "iPhone 13 Pro"). */
  model: SourcedDatum<string>;
  /** Storage capacity (e.g. "256 Go"). */
  capacity: SourcedDatum<string>;
  /** Condition as advertised by the source. */
  condition: SourcedDatum<Condition>;
  /** Price asked by the seller, in `currency`. */
  price: SourcedDatum<number>;
  /** Currency code. */
  currency: SourcedDatum<Currency>;
  /** Source name (e.g. "Leboncoin", "BackMarket"). */
  source: SourcedDatum<string>;
  /** URL of the listing, when available. */
  url: SourcedDatum<string>;
  /** When the offer was retrieved. */
  retrievedAt: SourcedDatum<string>;
  /** Shipping fees, when actually known. */
  shippingFees: SourcedDatum<number>;
  /** Additional information that is genuinely available (warranty, battery health, etc.). */
  extras: SourcedDatum<Record<string, string>>;
}

// ─── Price history (verified) ────────────────────────────────────────────

/**
 * A single point in a price history series, fully sourced.
 * Unlike the legacy PricePoint, this is never generated.
 */
export interface SourcedPricePoint {
  date: SourcedDatum<string>;
  price: SourcedDatum<number>;
  source: SourcedDatum<string>;
  sourceUrl: SourcedDatum<string>;
}

// ─── Legacy demo types (kept for backward compatibility, clearly separated) ─

/**
 * Legacy price-history point used only by the DEMO engine.
 * Will be replaced by SourcedPricePoint once real sources are connected.
 */
export interface PricePoint {
  date: string;
  price: number;
}

export interface Factor {
  label: string;
  detail: string;
  impact: 'positive' | 'neutral' | 'negative';
  icon: string;
}

/**
 * Legacy comparable listing used only by the DEMO engine.
 * Real offers use RealOffer instead.
 */
export interface ComparableListing {
  title: string;
  price: number;
  condition: string;
  location: string;
  source: string;
}

// ─── Analysis result ─────────────────────────────────────────────────────

/**
 * Result of an analysis. The `origin` field distinguishes demo results
 * (fictional data) from real results (verified data) and from cases where
 * no estimation is possible.
 */
export interface Analysis {
  id: string;
  title: string;
  category: Category;
  image: string;
  askPrice: number;
  score: number;
  verdict: string;
  marketAverage: number;
  priceLow: number;
  priceHigh: number;
  maxRecommended: number;
  priceHistory: PricePoint[];
  factors: Factor[];
  comparables: ComparableListing[];
  negotiationMessage: string;
  createdAt: number;
  /** Whether this analysis is based on demo data, real data, or no data at all. */
  origin: AnalysisOrigin;
}

/**
 * Describes the provenance and estimability of an analysis.
 * - `demo`        : fictional data, for demonstration only — never market data.
 * - `real`        : based on verified external data.
 * - `impossible`  : no estimation could be produced.
 */
export type AnalysisOrigin =
  | { kind: 'demo' }
  | { kind: 'real'; estimability: Estimability; sources: string[] }
  | { kind: 'impossible'; reason: string };

export interface AlertItem {
  id: string;
  productTitle: string;
  image: string;
  message: string;
  newScore: number;
  oldScore: number;
  newPrice: number;
  oldPrice: number;
  createdAt: number;
  read: boolean;
}

export type Screen = 'home' | 'analysis' | 'compare' | 'alerts' | 'history';
