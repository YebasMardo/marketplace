import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

interface NestErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

const FALLBACK_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.';

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return FALLBACK_MESSAGE;

  // SerializedError: thrown outside the request itself (e.g. a bug in a transform).
  if (!('status' in error)) {
    return error.message ?? FALLBACK_MESSAGE;
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  }
  if (error.status === 'TIMEOUT_ERROR') {
    return 'Le serveur met trop de temps à répondre. Réessayez.';
  }
  if (error.status === 'PARSING_ERROR') {
    return FALLBACK_MESSAGE;
  }

  const data = error.data as NestErrorBody | undefined;
  const message = data?.message;

  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string') return message;

  return FALLBACK_MESSAGE;
}
