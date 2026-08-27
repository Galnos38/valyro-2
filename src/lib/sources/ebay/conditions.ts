/**
 * eBay condition mapping utilities.
 *
 * Maps eBay condition IDs to Valyro's internal Condition type.
 * Only maps when the eBay condition is clear; otherwise returns 'unknown'.
 */

import type { Condition } from '@/types';
import { EBAY_CONDITION_IDS } from './types';

const CONDITION_MAP: Record<string, Condition> = {
  '1000': 'new',           // Neuf
  '1500': 'new',           // Neuf — autre
  '1750': 'new',           // Neuf avec emballage ouvert
  '2000': 'like-new',      // Reconditionné
  '2500': 'like-new',      // Reconditionné — vendeur
  '2750': 'like-new',      // Reconditionné — fabricant
  '3000': 'good',           // Utilisé
  '4000': 'very-good',     // Très bon état
  '5000': 'good',           // Bon état
  '6000': 'fair',           // État correct
  '7000': 'poor',           // Pour pièces ou ne fonctionne pas
};

/**
 * Convert an eBay condition ID to Valyro's Condition type.
 * Returns 'unknown' if the ID is not recognized.
 */
export function mapCondition(conditionId: string | undefined, displayName?: string): Condition {
  if (conditionId && conditionId in CONDITION_MAP) {
    return CONDITION_MAP[conditionId];
  }
  // Try to infer from display name as a fallback
  if (displayName) {
    const lower = displayName.toLowerCase();
    if (lower.includes('neuf') || lower.includes('new')) return 'new';
    if (lower.includes('reconditionné') || lower.includes('refurbished')) return 'like-new';
    if (lower.includes('très bon') || lower.includes('very good')) return 'very-good';
    if (lower.includes('bon') || lower.includes('good') || lower.includes('used')) return 'good';
    if (lower.includes('correct') || lower.includes('fair')) return 'fair';
    if (lower.includes('pièces') || lower.includes('for parts')) return 'poor';
  }
  return 'unknown';
}

/**
 * Get the French label for an eBay condition ID.
 */
export function conditionLabel(conditionId: string | undefined): string | null {
  if (!conditionId) return null;
  return EBAY_CONDITION_IDS[conditionId] ?? null;
}
