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

export type EventPrize = {
  id?: number;
  prizeIndex: number;
  label: string;
};

export type EventPublicData = {
  id: number;
  slug: string;
  title: string;
  coupleNames: string;
  eventDate: string | null;
  coverImageUrl: string | null;
  welcomeMessage: string | null;
  themeId: string;
  totalNumbers: number;
  ticketPriceCents: number;
  salesStatus: SalesStatus;
  prizes: EventPrize[];
};

export type EventDetail = {
  id: number;
  userId: number;
  slug: string;
  title: string;
  coupleNames: string;
  eventDate: string | null;
  coverImageUrl: string | null;
  welcomeMessage: string | null;
  themeId: string;
  totalNumbers: number;
  ticketPriceCents: number;
  padrinhoPin: string;
  pixKey: string | null;
  pixKeyType: string | null;
  salesStatus: SalesStatus;
  prizes: EventPrize[];
  createdAt: string;
  updatedAt: string;
};

export type EventSummary = {
  id: number;
  slug: string;
  title: string;
  coupleNames: string;
  eventDate: string | null;
  themeId: string;
  salesStatus: SalesStatus;
  totalNumbers: number;
  ticketPriceCents: number;
  createdAt: string;
};

export type BalanceSummary = {
  grossRevenueCents: number;
  platformFeeCents: number;
  platformFeePercent: number;
  netRevenueCents: number;
  totalWithdrawnCents: number;
  availableBalanceCents: number;
  pixKey: string | null;
  pixKeyType: string | null;
  lastPayoutAt: string | null;
};

export type Payout = {
  id: number;
  eventId: number;
  amountCents: number;
  pixKey: string;
  pixKeyType: string;
  status: string;
  transferId: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
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
  /** Cookie auth for session routes */
  withCredentials?: boolean;
};

export async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const { withCredentials, ...rest } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: withCredentials !== false ? 'include' : 'same-origin',
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

export function getEventsUrl(params?: { slug?: string; eventId?: number }): string {
  if (params?.slug) {
    return `${API_BASE}/events?slug=${encodeURIComponent(params.slug)}`;
  }
  if (params?.eventId) {
    return `${API_BASE}/events?eventId=${params.eventId}`;
  }
  return `${API_BASE}/events`;
}

export function fetchState(params?: { slug?: string; eventId?: number }): Promise<StateSnapshot> {
  const qs = new URLSearchParams();
  if (params?.slug) qs.set('slug', params.slug);
  if (params?.eventId) qs.set('eventId', String(params.eventId));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<StateSnapshot>(`/state${query}`);
}

export function checkNumbers(ids: number[], params?: { slug?: string; eventId?: number }): Promise<NumberCheck[]> {
  const qs = new URLSearchParams();
  qs.set('ids', ids.join(','));
  if (params?.slug) qs.set('slug', params.slug);
  if (params?.eventId) qs.set('eventId', String(params.eventId));
  return apiFetch<NumberCheck[]>(`/numbers/check?${qs.toString()}`);
}

export function fetchNumberBoard(params?: { slug?: string; eventId?: number }): Promise<NumberBoardCell[]> {
  const qs = new URLSearchParams();
  if (params?.slug) qs.set('slug', params.slug);
  if (params?.eventId) qs.set('eventId', String(params.eventId));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<NumberBoardCell[]>(`/numbers/board${query}`);
}

export function fetchPublicEvent(slug: string): Promise<EventPublicData> {
  return apiFetch<EventPublicData>(`/events/by-slug/${encodeURIComponent(slug)}`);
}

export function verifyPadrinhoPin(slug: string, pin: string): Promise<{ ok: true; eventId: number; slug: string; title: string }> {
  return apiFetch<{ ok: true; eventId: number; slug: string; title: string }>(
    `/events/by-slug/${encodeURIComponent(slug)}/verify-padrinho`,
    {
      method: 'POST',
      body: JSON.stringify({ pin }),
    },
  );
}

export function padrinhoMarkPaid(
  slug: string,
  input: {
    pin: string;
    buyerName: string;
    numberIds: number[];
  },
): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(
    `/events/by-slug/${encodeURIComponent(slug)}/padrinho/mark-paid`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function createOrder(input: {
  buyerName: string;
  numberIds: number[];
  slug?: string;
  eventId?: number;
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

// Couple authentication
export function registerCouple(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: User; sessionToken: string }> {
  return apiFetch<{ user: User; sessionToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loginCouple(input: {
  email: string;
  password: string;
}): Promise<{ user: User; sessionToken: string }> {
  return apiFetch<{ user: User; sessionToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMe(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/auth/me');
}

export function logoutCouple(): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/logout', {
    method: 'POST',
    body: '{}',
  });
}

// Couple dashboard events
export function fetchDashboardEvents(): Promise<EventSummary[]> {
  return apiFetch<EventSummary[]>('/dashboard/events');
}

export function createDashboardEvent(dto: {
  title?: string;
  coupleNames: string;
  eventDate?: string;
  coverImageUrl?: string;
  welcomeMessage?: string;
  themeId?: string;
  totalNumbers?: number;
  ticketPriceCents?: number;
  padrinhoPin?: string;
  pixKey?: string;
  pixKeyType?: string;
  prizes?: Array<{ prizeIndex: number; label: string }>;
}): Promise<EventDetail> {
  return apiFetch<EventDetail>('/dashboard/events', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function fetchDashboardEvent(id: number): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/dashboard/events/${id}`);
}

export function updateDashboardEvent(
  id: number,
  dto: Partial<{
    title: string;
    coupleNames: string;
    eventDate: string | null;
    coverImageUrl: string | null;
    welcomeMessage: string | null;
    themeId: string;
    padrinhoPin: string;
    pixKey: string | null;
    pixKeyType: string | null;
    prizes: Array<{ prizeIndex: number; label: string }>;
  }>,
): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/dashboard/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function setDashboardSalesStatus(
  id: number,
  status: SalesStatus,
): Promise<{ salesStatus: SalesStatus }> {
  return apiFetch<{ salesStatus: SalesStatus }>(`/dashboard/events/${id}/sales-status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export function drawDashboardEvent(
  id: number,
  prizeLabel?: string,
): Promise<DrawResult> {
  return apiFetch<DrawResult>(`/dashboard/events/${id}/draw`, {
    method: 'POST',
    body: JSON.stringify(prizeLabel ? { prizeLabel } : {}),
  });
}

// Digital wallet & Automated PIX Cashout
export function fetchEventBalance(id: number): Promise<BalanceSummary> {
  return apiFetch<BalanceSummary>(`/dashboard/events/${id}/balance`);
}

export function requestEventPayout(
  id: number,
  dto?: {
    amountCents?: number;
    pixKey?: string;
    pixKeyType?: string;
  },
): Promise<Payout> {
  return apiFetch<Payout>(`/dashboard/events/${id}/payouts`, {
    method: 'POST',
    body: JSON.stringify(dto ?? {}),
  });
}

export function listEventPayouts(id: number): Promise<Payout[]> {
  return apiFetch<Payout[]>(`/dashboard/events/${id}/payouts`);
}

// Legacy admin/padrinho backward compatibility
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
