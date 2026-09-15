const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type SalesStatus = 'open' | 'closed';

export type DrawResult = {
  prizeIndex: number;
  prizeLabel: string;
  numberId: number;
  buyerName: string;
  drawnAt: string;
};

export type RecentSale = {
  numberId: number;
  buyerName: string;
  updatedAt: string;
};

export type StateSnapshot = {
  salesStatus: SalesStatus;
  counts: {
    disponivel: number;
    reservado: number;
    pago: number;
  };
  arrecadadoCents: number;
  recentSales: RecentSale[];
  drawResults: DrawResult[];
};

export type NumberCheck = {
  id: number;
  status: string;
};

export type NumberBoardStatus = 'disponivel' | 'reservado' | 'pago';

export type NumberBoardCell = {
  id: number;
  status: NumberBoardStatus;
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

type ApiFetchOptions = RequestInit & {
  /** Cookie auth for padrinho/admin routes */
  withCredentials?: boolean;
};

async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const { withCredentials, ...rest } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: withCredentials ? 'include' : rest.credentials,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function getApiBase(): string {
  return API_BASE;
}

export function getEventsUrl(): string {
  return `${API_BASE}/events`;
}

export function fetchState(): Promise<StateSnapshot> {
  return apiFetch<StateSnapshot>('/state');
}

export function checkNumbers(ids: number[]): Promise<NumberCheck[]> {
  const qs = ids.join(',');
  return apiFetch<NumberCheck[]>(`/numbers/check?ids=${encodeURIComponent(qs)}`);
}

export function fetchNumberBoard(): Promise<NumberBoardCell[]> {
  return apiFetch<NumberBoardCell[]>('/numbers/board');
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

export function loginPadrinho(password: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/padrinho', {
    method: 'POST',
    body: JSON.stringify({ password }),
    withCredentials: true,
  });
}

export function loginAdmin(password: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/admin', {
    method: 'POST',
    body: JSON.stringify({ password }),
    withCredentials: true,
  });
}

export function markPaid(input: {
  buyerName: string;
  numberIds: number[];
}): Promise<OrderResponse> {
  return apiFetch<OrderResponse>('/padrinho/mark-paid', {
    method: 'POST',
    body: JSON.stringify(input),
    withCredentials: true,
  });
}

export function setSalesStatus(
  status: SalesStatus,
): Promise<{ salesStatus: SalesStatus }> {
  return apiFetch<{ salesStatus: SalesStatus }>('/admin/sales', {
    method: 'POST',
    body: JSON.stringify({ status }),
    withCredentials: true,
  });
}

export function drawNext(input?: {
  prizeLabel?: string;
}): Promise<DrawResult> {
  return apiFetch<DrawResult>('/admin/draw', {
    method: 'POST',
    body: JSON.stringify(input?.prizeLabel ? { prizeLabel: input.prizeLabel } : {}),
    withCredentials: true,
  });
}

export function isFakePaymentProvider(pixCopyPaste: string | null): boolean {
  if (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'fake') {
    return true;
  }
  return Boolean(pixCopyPaste?.startsWith('FAKE'));
}
