export type TimestampUnit = "second" | "millisecond";

export type TimestampResult = {
  raw: string;
  unit: TimestampUnit;
  milliseconds: number;
  seconds: number;
  chinaTime: string;
};

export type TimestampTextPart =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "timestamp";
      value: string;
      result: TimestampResult;
    };

const chinaDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatChinaTime(value: number) {
  const parts = chinaDateTimeFormatter.formatToParts(value);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

export function parseTimestamp(input: string): TimestampResult | null {
  const trimmed = input.trim();

  if (!/^\d{10}$|^\d{13}$/.test(trimmed)) {
    return null;
  }

  const unit: TimestampUnit = trimmed.length === 10 ? "second" : "millisecond";
  const milliseconds =
    unit === "second" ? Number(trimmed) * 1000 : Number(trimmed);

  if (!Number.isSafeInteger(milliseconds)) {
    return null;
  }

  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    raw: trimmed,
    unit,
    milliseconds,
    seconds: Math.floor(milliseconds / 1000),
    chinaTime: formatChinaTime(milliseconds),
  };
}

export function extractTimestamps(input: string) {
  const matches = input.match(/\b\d{10}\b|\b\d{13}\b/g) ?? [];
  const seen = new Set<string>();

  return matches.reduce<TimestampResult[]>((results, match) => {
    if (seen.has(match)) {
      return results;
    }

    const timestamp = parseTimestamp(match);

    if (timestamp) {
      seen.add(match);
      results.push(timestamp);
    }

    return results;
  }, []);
}

export function tokenizeTimestampText(input: string) {
  const regex = /\b\d{10}\b|\b\d{13}\b/g;
  const parts: TimestampTextPart[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(regex)) {
    const value = match[0];
    const index = match.index ?? 0;
    const timestamp = parseTimestamp(value);

    if (!timestamp) {
      continue;
    }

    if (index > lastIndex) {
      parts.push({
        type: "text",
        value: input.slice(lastIndex, index),
      });
    }

    parts.push({
      type: "timestamp",
      value,
      result: timestamp,
    });

    lastIndex = index + value.length;
  }

  if (lastIndex < input.length) {
    parts.push({
      type: "text",
      value: input.slice(lastIndex),
    });
  }

  return parts;
}

export function getTimestampUnitLabel(unit: TimestampUnit) {
  return unit === "second" ? "秒" : "毫秒";
}
