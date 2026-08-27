/**
 * eBay Browse API — type definitions.
 *
 * These types model the request and response structures of the eBay Browse
 * API `item_summary/search` endpoint, as documented at:
 *   https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/getItemSummarySearch
 *
 * Only the fields Valyro actually uses are defined. Unknown fields from the
 * API response are ignored.
 */

// ─── eBay condition IDs (subset relevant to second-hand phones) ──────────
// Source: https://developer.ebay.com/api-docs/buy/static/ref-ItemConditionIDValue.html
export const EBAY_CONDITION_IDS: Record<string, string> = {
  '1000': 'Neuf',
  '1500': 'Neuf — autre',
  '1750': 'Neuf avec emballage ouvert',
  '2000': 'Reconditionné',
  '2500': 'Reconditionné — vendeur',
  '2750': 'Reconditionné — fabricant',
  '3000': 'Utilisé',
  '4000': 'Très bon état',
  '5000': 'Bon état',
  '6000': 'État correct',
  '7000': 'Pour pièces ou ne fonctionne pas',
};

// ─── eBay API response types ─────────────────────────────────────────────

/** Amount object used by eBay for prices. */
export interface EbayAmount {
  value: string;
  currency: string;
}

/** Shipping cost container. */
export interface EbayShippingCost {
  value: string;
  currency: string;
}

/** Condition container. */
export interface EbayCondition {
  conditionId?: string;
  conditionDisplayName?: string;
}

/** A single item summary returned by the search endpoint. */
export interface EbayItemSummary {
  itemId?: string;
  title?: string;
  price?: EbayAmount;
  currentBidPrice?: EbayAmount;
  buyingOptions?: string[];
  condition?: EbayCondition;
  itemWebUrl?: string;
  itemLocation?: {
    country?: string;
    postalCode?: string;
    city?: string;
    stateOrProvince?: string;
  };
  shippingOptions?: Array<{
    shippingCost?: EbayShippingCost;
    type?: string;
  }>;
  seller?: {
    username?: string;
    feedbackPercentage?: string;
    feedbackScore?: number;
  };
  thumbnailImages?: Array<{ imageUrl?: string }>;
  image?: { imageUrl?: string };
}

/** Top-level response from item_summary/search. */
export interface EbaySearchResponse {
  itemSummaries?: EbayItemSummary[];
  total?: number;
  href?: string;
  limit?: number;
  offset?: number;
  next?: string;
  prev?: string;
  warnings?: Array<{
    errorId?: number;
    message?: string;
    domain?: string;
  }>;
}

// ─── eBay API error response ─────────────────────────────────────────────

export interface EbayErrorResponse {
  errors?: Array<{
    errorId?: number;
    domain?: string;
    subdomain?: string;
    category?: string;
    message?: string;
    longMessage?: string;
    parameters?: Array<{ name?: string; value?: string }>;
  }>;
}

// ─── Edge Function request/response ─────────────────────────────────────

/** Request sent by the frontend to the Valyro eBay Edge Function. */
export interface EbayProxyRequest {
  query: string;
  /** Maximum number of results to request from eBay (default 50, max 200). */
  limit?: number;
  /** eBay category IDs to filter by (e.g. ["9355"] for Cell Phones & Smartphones). */
  categoryIds?: string[];
  /** Aspect filters, e.g. { "Brand": ["Apple"], "Model": ["iPhone 13 Pro"] }. */
  aspectFilters?: Record<string, string[]>;
}

/** Response returned by the Edge Function to the frontend. */
export type EbayProxyResponse =
  | { status: 'ok'; data: EbaySearchResponse }
  | { status: 'no-results'; reason: string }
  | { status: 'error'; reason: string };
