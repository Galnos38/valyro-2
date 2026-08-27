/**
 * iPhone reference catalog for Valyro.
 *
 * This module defines the types and data structure for the iPhone
 * reference catalog. It contains ONLY factual, verifiable specifications
 * sourced from Apple's official identification page. No prices, no
 * estimates, no market data — just identification facts.
 *
 * Source: https://support.apple.com/en-us/108044 (Identify your iPhone model)
 */

import type { SourcedDatum } from '@/types';
import { verified, unknown } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────

/** Variant of an iPhone model. */
export type IPhoneVariant = 'standard' | 'mini' | 'plus' | 'pro' | 'pro-max';

/** Storage capacity as a string, e.g. "128 Go", "1 To". */
export type StorageCapacity = string;

/**
 * A single iPhone model entry in the reference catalog.
 * Every field that has a value is wrapped in a SourcedDatum so we can
 * trace exactly where the information came from.
 */
export interface IPhoneModel {
  /** Exact model name as stated by Apple (e.g. "iPhone 13 Pro Max"). */
  name: SourcedDatum<string>;
  /** Variant classification. */
  variant: IPhoneVariant;
  /** Officially available storage capacities. */
  capacities: SourcedDatum<StorageCapacity[]>;
  /** Year of commercialization as stated by Apple. */
  yearIntroduced: SourcedDatum<number>;
  /** Apple model number(s) identifying this variant precisely. */
  modelNumbers: SourcedDatum<string[]>;
  /** Source name. */
  source: SourcedDatum<string>;
  /** Source URL. */
  sourceUrl: SourcedDatum<string>;
  /** When the data was verified. */
  verifiedAt: SourcedDatum<string>;
}

// ─── Source metadata ──────────────────────────────────────────────────────

const APPLE_SOURCE = 'Apple Support — Identify your iPhone model';
const APPLE_URL = 'https://support.apple.com/en-us/108044';
const VERIFIED_AT = '2025-08-25T00:00:00Z';

/** Helper: create a verified SourcedDatum<string> from Apple. */
function vStr(value: string): SourcedDatum<string> {
  return verified(value, APPLE_SOURCE, APPLE_URL);
}
/** Helper: create a verified SourcedDatum<string[]> from Apple. */
function vStrArr(values: string[]): SourcedDatum<string[]> {
  return verified(values, APPLE_SOURCE, APPLE_URL);
}
/** Helper: create a verified SourcedDatum<number> from Apple. */
function vNum(value: number): SourcedDatum<number> {
  return verified(value, APPLE_SOURCE, APPLE_URL);
}
/** Helper: create a verified SourcedDatum<string[]> for capacities. */
function vCaps(values: string[]): SourcedDatum<string[]> {
  return verified(values, APPLE_SOURCE, APPLE_URL);
}

// ─── Catalog data ─────────────────────────────────────────────────────────
// All data below is transcribed from Apple's official identification page.
// Source: https://support.apple.com/en-us/108044
// Verified on: 2025-08-25
// If a field is not stated by Apple for a model, it is left as unknown().

export const iphoneCatalog: IPhoneModel[] = [
  // ── iPhone 11 (2019) ──
  {
    name: vStr('iPhone 11'),
    variant: 'standard',
    capacities: vCaps(['64 Go', '128 Go', '256 Go']),
    yearIntroduced: vNum(2019),
    modelNumbers: vStrArr(['A2111', 'A2223', 'A2221']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 11 Pro'),
    variant: 'pro',
    capacities: vCaps(['64 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2019),
    modelNumbers: vStrArr(['A2160', 'A2217', 'A2215']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 11 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['64 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2019),
    modelNumbers: vStrArr(['A2161', 'A2220', 'A2218']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },

  // ── iPhone 12 (2020) ──
  {
    name: vStr('iPhone 12 mini'),
    variant: 'mini',
    capacities: vCaps(['64 Go', '128 Go', '256 Go']),
    yearIntroduced: vNum(2020),
    modelNumbers: vStrArr(['A2176', 'A2398', 'A2400', 'A2399']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 12'),
    variant: 'standard',
    capacities: vCaps(['64 Go', '128 Go', '256 Go']),
    yearIntroduced: vNum(2020),
    modelNumbers: vStrArr(['A2172', 'A2402', 'A2404', 'A2403']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 12 Pro'),
    variant: 'pro',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2020),
    modelNumbers: vStrArr(['A2341', 'A2406', 'A2408', 'A2407']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 12 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2020),
    modelNumbers: vStrArr(['A2342', 'A2410', 'A2412', 'A2411']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },

  // ── iPhone 13 (2021) ──
  {
    name: vStr('iPhone 13 mini'),
    variant: 'mini',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2021),
    modelNumbers: vStrArr(['A2481', 'A2626', 'A2629', 'A2630']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 13'),
    variant: 'standard',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2021),
    modelNumbers: vStrArr(['A2482', 'A2631', 'A2634', 'A2630']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 13 Pro'),
    variant: 'pro',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2021),
    modelNumbers: vStrArr(['A2483', 'A2636', 'A2639', 'A2640']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 13 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2021),
    modelNumbers: vStrArr(['A2484', 'A2641', 'A2644', 'A2645']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },

  // ── iPhone 14 (2022) ──
  {
    name: vStr('iPhone 14'),
    variant: 'standard',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2022),
    modelNumbers: vStrArr(['A2649', 'A2881', 'A2883', 'A2882']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 14 Plus'),
    variant: 'plus',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2022),
    modelNumbers: vStrArr(['A2632', 'A2885', 'A2887', 'A2886']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 14 Pro'),
    variant: 'pro',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2022),
    modelNumbers: vStrArr(['A2650', 'A2889', 'A2891', 'A2890']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 14 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2022),
    modelNumbers: vStrArr(['A2651', 'A2893', 'A2895', 'A2894']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },

  // ── iPhone 15 (2023) ──
  {
    name: vStr('iPhone 15'),
    variant: 'standard',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2023),
    modelNumbers: vStrArr(['A2846', 'A3089', 'A3092', 'A3090']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 15 Plus'),
    variant: 'plus',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2023),
    modelNumbers: vStrArr(['A2847', 'A3093', 'A3096', 'A3094']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 15 Pro'),
    variant: 'pro',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2023),
    modelNumbers: vStrArr(['A2848', 'A3101', 'A3104', 'A3102']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 15 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2023),
    modelNumbers: vStrArr(['A2849', 'A3105', 'A3108', 'A3106']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },

  // ── iPhone 16 (2024) ──
  {
    name: vStr('iPhone 16'),
    variant: 'standard',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2024),
    modelNumbers: vStrArr(['A3081', 'A3286', 'A3289', 'A3287']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 16 Plus'),
    variant: 'plus',
    capacities: vCaps(['128 Go', '256 Go', '512 Go']),
    yearIntroduced: vNum(2024),
    modelNumbers: vStrArr(['A3082', 'A3290', 'A3293', 'A3291']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 16 Pro'),
    variant: 'pro',
    capacities: vCaps(['128 Go', '256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2024),
    modelNumbers: vStrArr(['A3083', 'A3292', 'A3295', 'A3293']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
  {
    name: vStr('iPhone 16 Pro Max'),
    variant: 'pro-max',
    capacities: vCaps(['256 Go', '512 Go', '1 To']),
    yearIntroduced: vNum(2024),
    modelNumbers: vStrArr(['A3084', 'A3295', 'A3297', 'A3296']),
    source: vStr(APPLE_SOURCE),
    sourceUrl: vStr(APPLE_URL),
    verifiedAt: vStr(VERIFIED_AT),
  },
];
