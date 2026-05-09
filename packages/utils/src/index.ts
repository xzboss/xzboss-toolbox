export type TimestampUnit = 'seconds' | 'milliseconds';

const MIN_MS = 0;
/** ~ 2100-01-01 UTC */
const MAX_MS = 4102444800000;

export function parseTimestampDigits(raw: string): string {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return '';
  }
  return trimmed;
}

export function detectTimestampUnit(digits: string): TimestampUnit | null {
  if (digits.length === 10) {
    return 'seconds';
  }
  if (digits.length === 13) {
    return 'milliseconds';
  }
  if (digits.length >= 11 && digits.length <= 12) {
    const n = Number(digits);
    if (Number.isFinite(n) && n >= MIN_MS && n <= MAX_MS) {
      return 'milliseconds';
    }
  }
  return null;
}

export function toMilliseconds(digits: string, unit: TimestampUnit): number {
  const n = Number(digits);
  if (!Number.isFinite(n)) {
    return NaN;
  }
  return unit === 'seconds' ? n * 1000 : n;
}

export function isValidTimestampMs(ms: number): boolean {
  return Number.isFinite(ms) && ms >= MIN_MS && ms <= MAX_MS;
}

export function formatTimestamp(ms: number): {
  local: string;
  iso: string;
  utc: string;
} {
  const d = new Date(ms);
  return {
    local: d.toLocaleString(),
    iso: d.toISOString(),
    utc: d.toUTCString(),
  };
}

export interface SingleTimestampResult {
  raw: string;
  digits: string;
  unit: TimestampUnit | null;
  ms: number | null;
  valid: boolean;
  formatted: ReturnType<typeof formatTimestamp> | null;
}

export function convertSingleTimestamp(raw: string): SingleTimestampResult {
  const digits = parseTimestampDigits(raw);
  if (!digits) {
    return { raw, digits: '', unit: null, ms: null, valid: false, formatted: null };
  }
  const unit = detectTimestampUnit(digits);
  if (!unit) {
    return { raw, digits, unit: null, ms: null, valid: false, formatted: null };
  }
  const ms = toMilliseconds(digits, unit);
  const valid = isValidTimestampMs(ms);
  return {
    raw,
    digits,
    unit,
    ms,
    valid,
    formatted: valid ? formatTimestamp(ms) : null,
  };
}

function tryParseTimestampValue(
  value: unknown,
): { unit: TimestampUnit; ms: number } | null {
  let digits: string;
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value)) {
    digits = String(Math.trunc(value));
  } else if (typeof value === 'string') {
    digits = parseTimestampDigits(value);
  } else {
    return null;
  }
  if (!digits) {
    return null;
  }
  const unit = detectTimestampUnit(digits);
  if (!unit) {
    return null;
  }
  const ms = toMilliseconds(digits, unit);
  if (!isValidTimestampMs(ms)) {
    return null;
  }
  return { unit, ms };
}

export interface JsonTimestampHit {
  path: string;
  raw: string | number;
  unit: TimestampUnit;
  ms: number;
  formatted: ReturnType<typeof formatTimestamp>;
}

export function scanJsonTimestamps(value: unknown, path = ''): JsonTimestampHit[] {
  const hits: JsonTimestampHit[] = [];
  const nextPath = (key: string) => (path ? `${path}.${key}` : key);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      hits.push(...scanJsonTimestamps(item, `${path}[${index}]`));
    });
    return hits;
  }

  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      hits.push(...scanJsonTimestamps(v, nextPath(k)));
    }
    return hits;
  }

  const parsed = tryParseTimestampValue(value);
  if (parsed) {
    hits.push({
      path: path || '$',
      raw: value as string | number,
      unit: parsed.unit,
      ms: parsed.ms,
      formatted: formatTimestamp(parsed.ms),
    });
  }

  return hits;
}

export function scanJsonText(
  text: string,
): { ok: true; hits: JsonTimestampHit[] } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(text);
    return { ok: true, hits: scanJsonTimestamps(parsed) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    };
  }
}

export interface TextTimestampHit {
  value: string;
  unit: TimestampUnit;
  ms: number;
  count: number;
  formatted: ReturnType<typeof formatTimestamp>;
}

const TEXT_STAMP_RE = /\b(\d{10}|\d{13})\b/g;

export function scanTextTimestamps(text: string): TextTimestampHit[] {
  const counts = new Map<
    string,
    { unit: TimestampUnit; ms: number; count: number }
  >();

  for (const match of text.matchAll(TEXT_STAMP_RE)) {
    const digits = match[1] ?? '';
    const unit = detectTimestampUnit(digits);
    if (!unit) {
      continue;
    }
    const ms = toMilliseconds(digits, unit);
    if (!isValidTimestampMs(ms)) {
      continue;
    }
    const prev = counts.get(digits);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(digits, { unit, ms, count: 1 });
    }
  }

  return Array.from(counts.entries()).map(([value, { unit, ms, count }]) => ({
    value,
    unit,
    ms,
    count,
    formatted: formatTimestamp(ms),
  }));
}
