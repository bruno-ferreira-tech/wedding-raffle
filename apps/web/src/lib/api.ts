const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type SalesStatus = 'open' | 'closed';

export type StateSnapshot = {
  salesStatus: SalesStatus;
  counts: {
    disponivel: number;
    reservado: number;
    pago: number;
  };
  arrecadadoCents: number;
};

export type NumberCheck = {
  id: number;
  status: string;
};

export type OrderStatusValue =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'cancelled';

export type OrderResponse = {
  id: number;
  status: OrderStatusValue;
  buyerName: string;
  source: string;
  totalCents: number;
  numberIds: number[];
  pixCopyPaste: string | null;
  pixQrBase64: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  numbers: Array<{
    id: number;
    status: string;
    buyerName: string | null;
  }>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return res.statusText || 'Erro na API';
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  return res.json() as Promise<T>;
}

export function getApiBase(): string {
  return API_BASE;
}

export function fetchState(): Promise<StateSnapshot> {
  return apiFetch<StateSnapshot>('/state');
}

export function checkNumbers(ids: number[]): Promise<NumberCheck[]> {
  const qs = ids.join(',');
  return apiFetch<NumberCheck[]>(`/numbers/check?ids=${encodeURIComponent(qs)}`);
}

export function createOrder(input: {
  buyerName: string;
  numberIds: number[];
}): Promise<OrderResponse> {
  return apiFetch<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchOrder(id: number): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(`/orders/${id}`);
}

export function confirmFakePayment(id: number): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(`/orders/${id}/confirm-fake`, {
    method: 'POST',
    body: '{}',
  });
}

export function isFakePaymentProvider(pixCopyPaste: string | null): boolean {
  if (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'fake') {
    return true;
  }
  return Boolean(pixCopyPaste?.startsWith('FAKE'));
}
