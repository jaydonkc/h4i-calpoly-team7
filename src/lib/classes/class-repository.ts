import mockSchedule from "@/data/classes.json";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

const GYM_TIME_ZONE = "America/Los_Angeles";

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: GYM_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, Number(part.value)])) as Record<
    "year" | "month" | "day",
    number
  >;
}

function toIsoDate(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatWeekLabel(firstDay: Date, lastDay: Date) {
  const firstMonth = firstDay.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const lastMonth = lastDay.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const firstDate = firstDay.getUTCDate();
  const lastDate = lastDay.getUTCDate();
  const firstYear = firstDay.getUTCFullYear();
  const lastYear = lastDay.getUTCFullYear();

  if (firstYear !== lastYear) return `${firstMonth} ${firstDate}, ${firstYear}—${lastMonth} ${lastDate}, ${lastYear}`;
  if (firstMonth !== lastMonth) return `${firstMonth} ${firstDate}—${lastMonth} ${lastDate}, ${lastYear}`;
  return `${firstMonth} ${firstDate}—${lastDate}, ${lastYear}`;
}

export function getCurrentWeek(now = new Date()) {
  const { year, month, day } = getDateParts(now);
  const today = new Date(Date.UTC(year, month - 1, day, 12));
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const todayIsoDate = toIsoDate(today);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    const isoDate = toIsoDate(date);

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      date: isoDate,
      ...(isoDate === todayIsoDate ? { isToday: true } : {}),
    };
  });

  const lastDay = new Date(monday);
  lastDay.setUTCDate(monday.getUTCDate() + 6);

  return { weekLabel: formatWeekLabel(monday, lastDay), days };
}

export interface ClassRepository {
  getSchedule(query?: ClassQuery): Promise<ClassSchedule>;
  getById(id: number): Promise<FitnessClass | null>;
}

class JsonClassRepository implements ClassRepository {
  async getSchedule(query: ClassQuery = {}): Promise<ClassSchedule> {
    const sourceSchedule = mockSchedule as ClassSchedule;
    const currentWeek = getCurrentWeek();
    const currentDatesBySourceDate = new Map(
      sourceSchedule.days.map((sourceDay, index) => [sourceDay.date, currentWeek.days[index].date]),
    );
    const classes = sourceSchedule.classes
      .map((fitnessClass) => ({
        ...fitnessClass,
        date: currentDatesBySourceDate.get(fitnessClass.date) ?? fitnessClass.date,
      }))
      .filter(
        (item) => (!query.date || item.date === query.date) && (!query.category || item.category === query.category),
      );

    return { ...currentWeek, classes };
  }

  async getById(id: number): Promise<FitnessClass | null> {
    return (mockSchedule as ClassSchedule).classes.find((item) => item.id === id) ?? null;
  }
}

// UI code depends on this contract, not the JSON source. Replace this instance
// with a database-backed repository without changing page or component code.
export const classRepository: ClassRepository = new JsonClassRepository();
