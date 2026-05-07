import { useCallback, useEffect, useReducer, useRef } from 'react';

import {
  CosmosConfigError,
  CosmosNotFoundError,
  CosmosRequestError,
  fetchCosmosProduct,
} from '@/services/cosmos';
import type { CosmosProduct } from '@/types/cosmos';

export type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; product: CosmosProduct }
  | { status: 'error'; message: string };

type Action =
  | { type: 'fetch' }
  | { type: 'success'; product: CosmosProduct }
  | { type: 'error'; message: string }
  | { type: 'reset' };

function reducer(_state: LookupState, action: Action): LookupState {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading' };
    case 'success':
      return { status: 'success', product: action.product };
    case 'error':
      return { status: 'error', message: action.message };
    case 'reset':
      return { status: 'idle' };
  }
}

function messageFromError(err: unknown): string {
  if (
    err instanceof CosmosNotFoundError ||
    err instanceof CosmosRequestError ||
    err instanceof CosmosConfigError
  ) {
    return err.message;
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return 'Consulta cancelada por timeout.';
  }
  return 'Falha de conexão com a API Cosmos.';
}

export function useProductLookup() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const lookup = useCallback((gtin: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: 'fetch' });

    fetchCosmosProduct(gtin, controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) dispatch({ type: 'success', product });
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'error', message: messageFromError(err) });
        }
      });
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    dispatch({ type: 'reset' });
  }, []);

  return { state, lookup, reset };
}
