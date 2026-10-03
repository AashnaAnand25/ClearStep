function pad(n: number) {
  return String(n).padStart(2, "0");
}

function escapeIcs(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Gregorian calendar date with room for the exclusive end date. */
export function isReminderDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < "0001-01-01" || value > "9999-12-30") return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// RFC 5545 content lines are limited to 75 UTF-8 octets, including continuation spaces.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}

/** Builds an all-day .ics event for a personal reminder (YYYY-MM-DD). */
export function buildReminderIcs(date: string, title: string, description: string): string {
  if (!isReminderDate(date)) throw new RangeError("Choose a valid reminder date (YYYY-MM-DD).");
  const start = date.replace(/-/g, "");
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClearStep//Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:clearstep-${start}-${now.getTime()}@clearstep.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldLine)
    .join("\r\n");
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
