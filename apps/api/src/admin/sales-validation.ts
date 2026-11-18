export type SalesStatus = 'open' | 'closed';

export type SalesStatusInput = {
  status: SalesStatus;
};

export function parseSalesStatusInput(raw: {
  status?: unknown;
}): SalesStatusInput {
  if (raw.status !== 'open' && raw.status !== 'closed') {
    throw new Error("status deve ser 'open' ou 'closed'");
  }
  return { status: raw.status };
}
