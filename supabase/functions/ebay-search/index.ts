/**
 * Edge Function: ebay-search
 *
 * Acts as a secure proxy between the Valyro frontend and the eBay Browse API.
 * The frontend never sees eBay API credentials — they are stored as Supabase
 * Edge Function secrets and used only here.
 *
 * Flow:
 *  1. Receive a search request from the frontend (query, limit, categoryIds, aspectFilters).
 *  2. Obtain an eBay Application Access token via client credentials grant.
 *  3. Call eBay Browse API `item_summary/search` on the EBAY_FR marketplace.
 *  4. Return the raw eBay response to the frontend, or an explicit error.
 *
 * Required secrets (set via Supabase dashboard or CLI):
 *  - EBAY_CLIENT_ID     : eBay application client ID
 *  - EBAY_CLIENT_SECRET : eBay application client secret
 *
 * This function NEVER fabricates data. If eBay returns nothing or errors,
 * the function returns an explicit error/no-results status.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_BASE = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const EBAY_MARKETPLACE = "EBAY_FR";
const EBAY_SCOPE = "https://api.ebay.com/oauth/api_scope/buy.marketplace.browse";

// ─── Types ────────────────────────────────────────────────────────────────

interface EbayProxyRequest {
  query: string;
  limit?: number;
  categoryIds?: string[];
  aspectFilters?: Record<string, string[]>;
}

interface EbaySearchResponse {
  itemSummaries?: unknown[];
  total?: number;
  warnings?: Array<{ errorId?: number; message?: string }>;
}

interface EbayErrorResponse {
  errors?: Array<{
    errorId?: number;
    message?: string;
    longMessage?: string;
    domain?: string;
  }>;
}

type ProxyResponse =
  | { status: "ok"; data: EbaySearchResponse }
  | { status: "no-results"; reason: string }
  | { status: "error"; reason: string };

// ─── Token retrieval ──────────────────────────────────────────────────────

/**
 * Obtain an Application Access token from eBay using client credentials grant.
 * Returns null on failure with a reason.
 */
async function getEbayToken(): Promise<{ token: string } | { error: string }> {
  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return { error: "Clés API eBay non configurées sur le serveur." };
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  try {
    const response = await fetch(EBAY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: EBAY_SCOPE,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: "Authentification eBay échouée : clés invalides." };
      }
      return { error: `Erreur d'authentification eBay (${response.status}).` };
    }

    const data = await response.json();
    if (!data.access_token) {
      return { error: "Réponse d'authentification eBay invalide : jeton manquant." };
    }
    return { token: data.access_token };
  } catch {
    return { error: "Erreur réseau lors de l'authentification eBay." };
  }
}

// ─── Search ───────────────────────────────────────────────────────────────

/**
 * Call the eBay Browse API search endpoint.
 */
async function searchEbay(
  token: string,
  request: EbayProxyRequest
): Promise<{ ok: true; data: EbaySearchResponse } | { ok: false; reason: string; status?: number }> {
  // Build URL with query parameters
  const params = new URLSearchParams();
  params.set("q", request.query);
  params.set("limit", String(request.limit ?? 50));
  params.set("fieldgroups", "MATCHING_ITEMS");

  if (request.categoryIds && request.categoryIds.length > 0) {
    params.set("category_ids", request.categoryIds.join(","));
  }

  // Build aspect_filter parameter
  // Format: categoryId:{aspectName:{value1|value2},aspectName:{value1}}
  if (request.aspectFilters && request.categoryIds && request.categoryIds.length > 0) {
    const aspects: string[] = [];
    for (const [name, values] of Object.entries(request.aspectFilters)) {
      if (values.length > 0) {
        aspects.push(`${name}:{${values.join("|")}}`);
      }
    }
    if (aspects.length > 0) {
      params.set("aspect_filter", `${request.categoryIds[0]},${aspects.join(",")}`);
    }
  }

  const url = `${EBAY_BROWSE_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to parse eBay error response
      let errorDetail = `Erreur eBay (${response.status}).`;
      try {
        const errorBody: EbayErrorResponse = await response.json();
        if (errorBody.errors && errorBody.errors.length > 0) {
          errorDetail = errorBody.errors[0].longMessage ?? errorBody.errors[0].message ?? errorDetail;
        }
      } catch {
        // Keep default error
      }
      return { ok: false, reason: errorDetail, status: response.status };
    }

    const data: EbaySearchResponse = await response.json();
    return { ok: true, data };
  } catch {
    return { ok: false, reason: "Erreur réseau lors de la recherche eBay." };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    const body: ProxyResponse = { status: "error", reason: "Méthode HTTP non autorisée." };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let requestBody: EbayProxyRequest;
  try {
    requestBody = await req.json() as EbayProxyRequest;
  } catch {
    const body: ProxyResponse = { status: "error", reason: "Corps de requête invalide." };
    return new Response(JSON.stringify(body), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate query
  if (!requestBody.query || !requestBody.query.trim()) {
    const body: ProxyResponse = { status: "error", reason: "Requête de recherche vide." };
    return new Response(JSON.stringify(body), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Step 1: Get eBay token
  const tokenResult = await getEbayToken();
  if ("error" in tokenResult) {
    const body: ProxyResponse = { status: "error", reason: tokenResult.error };
    return new Response(JSON.stringify(body), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Step 2: Search eBay
  const searchResult = await searchEbay(tokenResult.token, requestBody);
  if (!searchResult.ok) {
    const body: ProxyResponse = { status: "error", reason: searchResult.reason };
    return new Response(JSON.stringify(body), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Step 3: Check for results
  const items = searchResult.data.itemSummaries ?? [];
  if (items.length === 0) {
    const body: ProxyResponse = {
      status: "no-results",
      reason: "Aucune offre trouvée sur eBay pour cette recherche.",
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Step 4: Return the data
  const body: ProxyResponse = { status: "ok", data: searchResult.data };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
