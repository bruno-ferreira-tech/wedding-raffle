export type DrawInput = {
  prizeLabel: string | undefined;
};

export function parseDrawInput(raw: {
  prizeLabel?: unknown;
}): DrawInput {
  if (raw.prizeLabel === undefined || raw.prizeLabel === null) {
    return { prizeLabel: undefined };
  }

  if (typeof raw.prizeLabel !== 'string') {
    throw new Error('Rótulo do prêmio inválido');
  }

  const trimmed = raw.prizeLabel.trim();
  if (trimmed === '') {
    throw new Error('Rótulo do prêmio inválido');
  }

  return { prizeLabel: trimmed };
}
