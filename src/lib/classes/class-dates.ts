// UTC dates represent gym calendar days, independent of the server timezone.
export function getGymCalendarDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)!.value);
  return new Date(Date.UTC(value("year"), value("month") - 1, value("day")));
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isValidClassDate(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && toIsoDate(date) === value;
}
