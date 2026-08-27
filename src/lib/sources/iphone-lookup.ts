/**
 * iPhone catalog lookup and matching utilities.
 *
 * These functions take a free-text query from the user and try to identify
 * which iPhone model(s) it refers to, using ONLY the reference catalog.
 * No guessing: if a match is ambiguous or not found, it returns null.
 */

import type { SourcedDatum } from '@/types';
import { unknown } from '@/types';
import type { IPhoneModel, IPhoneVariant } from './iphone-catalog';
import { iphoneCatalog } from './iphone-catalog';

// ─── Result types ─────────────────────────────────────────────────────────

/**
 * Result of identifying an iPhone from user text.
 * - `found`       : exactly one model matches.
 * - `ambiguous`   : multiple models match (user must disambiguate).
 * - `not-found`   : no model in the catalog matches.
 */
export type IPhoneLookupResult =
  | { status: 'found'; model: IPhoneModel }
  | { status: 'ambiguous'; models: IPhoneModel[]; reason: string }
  | { status: 'not-found'; reason: string };

// ─── Matching helpers ─────────────────────────────────────────────────────

const variantKeywords: Record<IPhoneVariant, string[]> = {
  'standard': [],
  'mini': ['mini'],
  'plus': ['plus'],
  'pro': ['pro'],
  'pro-max': ['pro max', 'pro-max', 'promax'],
};

/**
 * Determine the variant from user text.
 * Returns null if no variant keyword is found (defaults to standard).
 */
function detectVariant(text: string): IPhoneVariant | null {
  const lower = text.toLowerCase();
  if (variantKeywords['pro-max'].some((kw) => lower.includes(kw))) return 'pro-max';
  if (variantKeywords['pro'].some((kw) => lower.includes(kw))) return 'pro';
  if (variantKeywords['mini'].some((kw) => lower.includes(kw))) return 'mini';
  if (variantKeywords['plus'].some((kw) => lower.includes(kw))) return 'plus';
  return null;
}

/**
 * Extract the generation number (11-16) from text.
 */
function detectGeneration(text: string): number | null {
  const match = text.match(/iphone\s*(1[1-6])/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract storage capacity from text (e.g. "256 go", "256gb", "1 to").
 */
export function detectCapacity(text: string): SourcedDatum<string> {
  const lower = text.toLowerCase();
  // Match patterns like "256 go", "256go", "256 gb", "256gb", "1 to", "1tb"
  const goMatch = lower.match(/(\d{1,3})\s*(?:go|gb)/);
  const toMatch = lower.match(/(\d)\s*(?:to|tb)/);
  if (goMatch) {
    return { value: `${goMatch[1]} Go`, confidence: 'verified', source: 'User input', sourceUrl: null, retrievedAt: new Date().toISOString() };
  }
  if (toMatch) {
    return { value: `${toMatch[1]} To`, confidence: 'verified', source: 'User input', sourceUrl: null, retrievedAt: new Date().toISOString() };
  }
  return unknown<string>();
}

// ─── Public lookup ───────────────────────────────────────────────────────

/**
 * Try to identify a single iPhone model from free text.
 * Returns the most specific match possible, or null if ambiguous/not found.
 */
export function lookupIPhone(text: string): IPhoneLookupResult {
  const generation = detectGeneration(text);
  if (generation === null) {
    return { status: 'not-found', reason: 'Aucun numéro de génération iPhone détecté (11 à 16).' };
  }

  const variant = detectVariant(text);
  const candidates = iphoneCatalog.filter((m) => {
    const name = m.name.value ?? '';
    const genMatch = name.includes(`iPhone ${generation}`);
    if (!genMatch) return false;
    if (variant === null) {
      // No variant keyword: only match standard variant
      return m.variant === 'standard';
    }
    return m.variant === variant;
  });

  if (candidates.length === 0) {
    return {
      status: 'not-found',
      reason: variant
        ? `Aucun iPhone ${generation} ${variant} trouvé dans le catalogue.`
        : `Aucun iPhone ${generation} (standard) trouvé dans le catalogue.`,
    };
  }

  if (candidates.length === 1) {
    return { status: 'found', model: candidates[0] };
  }

  return {
    status: 'ambiguous',
    models: candidates,
    reason: `Plusieurs modèles correspondent à « iPhone ${generation}${variant ? ' ' + variant : ''} ». Précisez la variante.`,
  };
}

/**
 * List all models in the catalog (for browsing/debugging).
 */
export function listAllModels(): IPhoneModel[] {
  return iphoneCatalog;
}

/**
 * Find a model by its Apple model number (e.g. "A2849").
 */
export function findByModelNumber(modelNumber: string): IPhoneModel | null {
  const upper = modelNumber.toUpperCase();
  return iphoneCatalog.find((m) => {
    const nums = m.modelNumbers.value ?? [];
    return nums.some((n) => n.toUpperCase() === upper);
  }) ?? null;
}
