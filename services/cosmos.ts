import type { CosmosProduct } from '@/types/cosmos';

const COSMOS_BASE_URL = 'https://api.cosmos.bluesoft.com.br';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Token lido de `EXPO_PUBLIC_COSMOS_TOKEN`.
 *
 * IMPORTANTE: variáveis `EXPO_PUBLIC_*` ficam embutidas no bundle e são
 * visíveis para qualquer cliente que extrair o app. Para produção real,
 * mover esta chamada para um backend próprio que armazene o token no
 * servidor e exponha um endpoint autenticado para o app consumir.
 */
const COSMOS_TOKEN = process.env.EXPO_PUBLIC_COSMOS_TOKEN;

export class CosmosNotFoundError extends Error {
  constructor() {
    super('Produto não encontrado na base Cosmos.');
    this.name = 'CosmosNotFoundError';
  }
}

export class CosmosRequestError extends Error {
  constructor(public readonly status: number) {
    super(`Erro ${status} ao consultar a API.`);
    this.name = 'CosmosRequestError';
  }
}

export class CosmosConfigError extends Error {
  constructor() {
    super('EXPO_PUBLIC_COSMOS_TOKEN não definido. Copie .env.example para .env e configure.');
    this.name = 'CosmosConfigError';
  }
}

export async function fetchCosmosProduct(
  gtin: string,
  signal?: AbortSignal,
): Promise<CosmosProduct> {
  if (!COSMOS_TOKEN) throw new CosmosConfigError();

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => timeoutController.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(`${COSMOS_BASE_URL}/gtins/${encodeURIComponent(gtin)}`, {
      headers: {
        'X-Cosmos-Token': COSMOS_TOKEN,
        'Content-Type': 'application/json',
      },
      signal: timeoutController.signal,
    });

    if (res.status === 404) throw new CosmosNotFoundError();
    if (!res.ok) throw new CosmosRequestError(res.status);

    return (await res.json()) as CosmosProduct;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}
