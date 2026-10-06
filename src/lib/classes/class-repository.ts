import connectDB from "@/database/db";
import FitnessClassModel from "@/database/userSchema";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

export interface ClassRepository {
  getSchedule(query?: ClassQuery): Promise<ClassSchedule>;
  getById(id: number): Promise<FitnessClass | null>;
}

type ClassRecord = Omit<FitnessClass, "id" | "date"> & {
  _id: { toString(): string };
  id?: number;
  date: string;
};

function toFitnessClass(record: ClassRecord, date = record.date): FitnessClass {
  return {
    id: record.id ?? record._id.toString(),
    date,
    title: record.title,
    category: record.category,
    time: record.time,
    end: record.end,
    coach: record.coach,
    room: record.room,
    level: record.level,
    duration: record.duration,
    spots: record.spots,
    color: record.color,
    description: record.description,
  };
}

function getWeekDates(today: Date) {
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const isoDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      date,
      isoDate,
      dayOfMonth: String(date.getDate()),
      label: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

function matchWeekDate(classDate: string, days: ReturnType<typeof getWeekDates>[number][]) {
  const legacyDayOfMonth = /^\d{1,2}$/.test(classDate) ? classDate.padStart(2, "0") : null;
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(classDate) ? classDate.slice(0, 10) : null;
  const parsedDate = !legacyDayOfMonth && !isoDate ? new Date(classDate) : null;
  const parsedIsoDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? [
          parsedDate.getFullYear(),
          String(parsedDate.getMonth() + 1).padStart(2, "0"),
          String(parsedDate.getDate()).padStart(2, "0"),
        ].join("-")
      : null;

  return days.find(
    (day) =>
      day.isoDate === isoDate || day.isoDate === parsedIsoDate || day.dayOfMonth.padStart(2, "0") === legacyDayOfMonth,
  );
}

function getTimeSortValue(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

class MongoClassRepository implements ClassRepository {
  async getSchedule(query: ClassQuery = {}): Promise<ClassSchedule> {
    await connectDB();

    const week = getWeekDates(new Date());
    const records = await FitnessClassModel.find().sort({ date: 1, time: 1 }).lean<ClassRecord[]>().exec();
    const classes = records
      .flatMap((record) => {
        const day = matchWeekDate(record.date, week);
        if (!day || (query.date && query.date !== day.isoDate && query.date !== day.dayOfMonth)) return [];
        if (query.category && record.category !== query.category) return [];
        return [toFitnessClass(record, day.isoDate)];
      })
      .sort((first, second) => {
        const dateOrder = first.date.localeCompare(second.date);
        if (dateOrder) return dateOrder;
        const timeOrder = getTimeSortValue(first.time) - getTimeSortValue(second.time);
        return timeOrder || first.time.localeCompare(second.time);
      });
    const firstDay = week[0].date;
    const lastDay = week[6].date;

    return {
      weekLabel: `${firstDay.toLocaleDateString("en-US", { month: "long", day: "numeric" })}—${lastDay.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      days: week.map(({ date, isoDate, label, isToday }) => ({
        label,
        date: isoDate,
        ...(isToday ? { isToday: true } : {}),
      })),
      classes,
    };
  }

  async getById(id: number): Promise<FitnessClass | null> {
    await connectDB();
    const record = await FitnessClassModel.findOne({ id }).lean<ClassRecord>().exec();
    return record ? toFitnessClass(record) : null;
  }
}

export const classRepository: ClassRepository = new MongoClassRepository();
