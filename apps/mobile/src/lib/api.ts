import { API_URL } from '@/config';

/** Erreur définitive : la requête a été refusée, la rejouer ne servirait à rien. */
export class ApiRejected extends Error {}

export const apiEnabled = API_URL.length > 0;

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    if (response.status >= 400 && response.status < 500 && response.status !== 401 && response.status !== 408 && response.status !== 429) {
      throw new ApiRejected(`Requête refusée (${response.status})`);
    }
    if (!response.ok) throw new Error(`Erreur du serveur (${response.status})`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
