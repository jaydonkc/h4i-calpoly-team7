import { getGymCalendarDate, toIsoDate } from "@/lib/classes/class-dates";

export function hasClassStarted(date: string, time: string, now = new Date()): boolean {
  const today = toIsoDate(getGymCalendarDate(now));
  if (date !== today) return date < today;
  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const minutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };
  return minutes(time) <= minutes(currentTime);
}

export function getClassStatus(date: string, time: string, end: string, now = new Date()) {
  if (hasClassStarted(date, end, now)) return "Completed";
  if (hasClassStarted(date, time, now)) return "In progress";
  return "Upcoming";
}
