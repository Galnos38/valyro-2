/**
 * eBay Browse API connector for Valyro.
 *
 * Implements the PriceSource interface to search for real iPhone offers
 * on eBay France via the eBay Browse API. This connector calls a Supabase
 * Edge Function (the "proxy") that holds the eBay API credentials server-side
 * and performs the actual API call. The frontend never sees or handles API keys.
 *
 * Design principles:
 *  - Never fabricates data. If eBay returns nothing, returns 'no-results'.
 *  - Never falls back to fake prices. If an offer is missing a price or
 *    cannot be identified, it is discarded.
 *  - All errors (network, auth, missing key, malformed response) produce
 *    an explicit SourceResult with a human-readable reason.
 */

import type { SourcedDatum, RealOffer, Condition, Currency } from '@/types';
import { verified, unknown } from '@/types';
import type { PriceSource, ProductQuery, SourceResult } from '../types';
import type {
  EbayProxyRequest,
  EbayProxyResponse,
  EbayItemSummary,
  EbaySearchResponse,
} from './types';
import { mapCondition } from './conditions';
import { lookupIPhone } from '../iphone-lookup';

// ─── Constants ────────────────────────────────────────────────────────────

const SOURCE_ID = 'ebay';
const SOURCE_LABEL = 'eBay';
const EBAY_FR_CATEGORY_PHONES = '9355'; // Cell Phones & Smartphones (FR)
const MAX_RESULTS = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Build the search query string for eBay from a ProductQuery.
 * Combines model name and capacity for precision.
 */
function buildSearchQuery(query: ProductQuery): string {
  const parts: string[] = [];
  if (query.brand) parts.push(query.brand);
  if (query.model) parts.push(query.model);
  if (query.capacity) parts.push(query.capacity);
  return parts.join(' ').trim() || query.rawText;
}

/**
 * Build aspect filters for eBay. Uses Brand=Apple and the detected model
 * when the iPhone catalog can identify it.
 */
function buildAspectFilters(query: ProductQuery): Record<string, string[]> | undefined {
  const aspects: Record<string, string[]> = { Brand: ['Apple'] };

  if (query.model) {
    // eBay aspect values for Model often use the full name like "iPhone 13 Pro"
    aspects.Model = [query.model];
  }
  return aspects;
}

/**
 * Validate that an eBay item summary has enough verifiable data to be
 * considered a real offer. Returns false if the price or product identity
 * is missing or unparseable.
 */
function isValidOffer(item: EbayItemSummary): boolean {
  if (!item.itemId) return false;
  if (!item.title) return false;
  const price = item.price ?? item.currentBidPrice;
  if (!price || !price.value || !price.currency) return false;
  const numericPrice = parseFloat(price.value);
  if (isNaN(numericPrice) || numericPrice <= 0) return false;
  return true;
}

/**
 * Convert a single eBay ItemSummary into a RealOffer.
 * Every field is wrapped in a SourcedDatum. Fields that are not provided
 * by eBay are left as unknown() — never guessed.
 */
function mapToRealOffer(item: EbayItemSummary): RealOffer {
  const retrievedAt = new Date().toISOString();
  const sourceName = 'eBay';

  const price = item.price ?? item.currentBidPrice;
  const numericPrice = price ? parseFloat(price.value) : NaN;

  // Condition
  const condition: Condition = mapCondition(
    item.condition?.conditionId,
    item.condition?.conditionDisplayName,
  );

  // Shipping fees — only when actually provided
  const shipping = item.shippingOptions?.[0]?.shippingCost;
  const shippingFees: SourcedDatum<number> =
    shipping && shipping.value
      ? verified(parseFloat(shipping.value), sourceName, item.itemWebUrl ?? undefined)
      : unknown<number>();

  // Additional info
  const extras: Record<string, string> = {};
  if (item.seller?.username) extras['seller'] = item.seller.username;
  if (item.seller?.feedbackScore !== undefined) extras['sellerFeedbackScore'] = String(item.seller.feedbackScore);
  if (item.seller?.feedbackPercentage) extras['sellerFeedbackPercentage'] = item.seller.feedbackPercentage;
  if (item.buyingOptions?.length) extras['buyingOptions'] = item.buyingOptions.join(', ');
  if (item.itemLocation?.country) extras['itemCountry'] = item.itemLocation.country;
  if (item.itemLocation?.city) extras['itemCity'] = item.itemLocation.city;

  return {
    model: item.title
      ? verified(item.title, sourceName, item.itemWebUrl ?? undefined)
      : unknown<string>(),
    capacity: unknown<string>(),
    condition: {
      value: condition,
      confidence: condition === 'unknown' ? 'unknown' : 'verified',
      source: condition === 'unknown' ? null : sourceName,
      sourceUrl: item.itemWebUrl ?? null,
      retrievedAt,
    },
    price: verified(numericPrice, sourceName, item.itemWebUrl ?? undefined),
    currency: verified(price?.currency ?? 'EUR', sourceName, item.itemWebUrl ?? undefined),
    source: verified(sourceName, sourceName, item.itemWebUrl ?? undefined),
    url: item.itemWebUrl
      ? verified(item.itemWebUrl, sourceName, item.itemWebUrl)
      : unknown<string>(),
    retrievedAt: verified(retrievedAt, sourceName, item.itemWebUrl ?? undefined),
    shippingFees,
    extras: Object.keys(extras).length > 0
      ? verified(extras, sourceName, item.itemWebUrl ?? undefined)
      : unknown<Record<string, string>>(),
  };
}

// ─── PriceSource implementation ──────────────────────────────────────────

/**
 * The eBay connector. Searches eBay France for iPhone offers.
 *
 * Calls the Supabase Edge Function `ebay-search` which acts as a secure
 * proxy to the eBay Browse API. The Edge Function holds the API credentials
 * and returns either a valid eBaySearchResponse or an error.
 */
export const ebaySource: PriceSource = {
  id: SOURCE_ID,
  label: SOURCE_LABEL,
  categories: ['phones'],

  async fetchOffers(query: ProductQuery): Promise<SourceResult> {
    // Step 1: Validate that we have enough info to search
    if (!query.model && !query.rawText.trim()) {
      return { status: 'error', reason: 'Requête invalide : aucun modèle ou texte fourni.' };
    }

    // Step 2: Build the proxy request
    const searchQuery = buildSearchQuery(query);
    if (!searchQuery) {
      return { status: 'error', reason: 'Impossible de construire une requête de recherche valide.' };
    }

    const requestBody: EbayProxyRequest = {
      query: searchQuery,
      limit: MAX_RESULTS,
      categoryIds: [EBAY_FR_CATEGORY_PHONES],
      aspectFilters: buildAspectFilters(query),
    };

    // Step 3: Call the Edge Function proxy
    let response: Response;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
      if (!supabaseUrl || !supabaseAnonKey) {
        return { status: 'error', reason: 'Configuration Supabase manquante.' };
      }
      response = await fetch(`${supabaseUrl}/functions/v1/ebay-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } catch {
      return { status: 'error', reason: 'Erreur réseau : impossible de joindre le serveur.' };
    }

    // Step 4: Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { status: 'error', reason: 'Erreur d\'authentification au serveur de recherche.' };
      }
      if (response.status === 500) {
        return { status: 'error', reason: 'Erreur interne du serveur de recherche.' };
      }
      return { status: 'error', reason: `Erreur serveur (${response.status}).` };
    }

    // Step 5: Parse the proxy response
    let proxyResult: EbayProxyResponse;
    try {
      proxyResult = await response.json() as EbayProxyResponse;
    } catch {
      return { status: 'error', reason: 'Réponse illisible du serveur de recherche.' };
    }

    // Step 6: Handle proxy-level errors
    if (proxyResult.status === 'error') {
      return { status: 'error', reason: proxyResult.reason };
    }
    if (proxyResult.status === 'no-results') {
      return { status: 'no-results', reason: proxyResult.reason };
    }

    // Step 7: Extract and validate offers
    const searchData = proxyResult.data as EbaySearchResponse;
    const rawItems = searchData.itemSummaries ?? [];

    if (rawItems.length === 0) {
      return { status: 'no-results', reason: 'Aucune offre trouvée sur eBay pour ce produit.' };
    }

    // Filter out offers that don't have enough verifiable data
    const validItems = rawItems.filter(isValidOffer);

    if (validItems.length === 0) {
      return {
        status: 'no-results',
        reason: 'Les offres trouvées sur eBay ne contiennent pas suffisamment de données vérifiables (prix ou identité manquants).',
      };
    }

    // Map to RealOffer[]
    const offers = validItems.map(mapToRealOffer);

    return { status: 'ok', offers };
  },
};
