import { isObjectIdOrHexString } from "mongoose";
import { getGymCalendarDate, toIsoDate } from "@/lib/classes/class-dates";
import connectDB from "@/database/db";
import FitnessClassModel from "@/database/userSchema";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

export interface ClassRepository {
  getSchedule(query?: ClassQuery): Promise<ClassSchedule>;
  getById(id: FitnessClass["id"]): Promise<FitnessClass | null>;
}

type ClassRecord = Omit<FitnessClass, "id" | "date"> & {
  _id: { toString(): string };
  id?: number;
  date: string;
};

function toFitnessClass(record: ClassRecord, date = record.date): FitnessClass {
  return {
    id: record._id.toString(),
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
    description: record.description,
  };
}

function getWeekDates(now: Date) {
  const today = getGymCalendarDate(now);
  const monday = new Date(today);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    const isoDate = toIsoDate(date);

    return {
      date,
      isoDate,
      dayOfMonth: String(date.getUTCDate()),
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
      isToday: isoDate === toIsoDate(today),
    };
  });
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

function matchWeekDate(classDate: string, days: ReturnType<typeof getWeekDates>[number][]) {
  const legacyDayOfMonth = /^\d{1,2}$/.test(classDate) ? classDate.padStart(2, "0") : null;
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(classDate) ? classDate.slice(0, 10) : null;
  const parsedDate = !legacyDayOfMonth && !isoDate ? new Date(classDate) : null;
  const parsedIsoDate =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? toIsoDate(getGymCalendarDate(parsedDate)) : null;

  return days.find(
    (day) =>
      day.isoDate === isoDate || day.isoDate === parsedIsoDate || day.dayOfMonth.padStart(2, "0") === legacyDayOfMonth,
  );
}

function getTimeSortValue(time: string) {
  const match = time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (!match) return -1;

  return Number(match[1]) * 60 + Number(match[2]);
}

class MongoClassRepository implements ClassRepository {
  async getSchedule(query: ClassQuery = {}): Promise<ClassSchedule> {
    await connectDB();

    const week = getWeekDates(new Date());
    const records = await FitnessClassModel.find().sort({ date: 1, time: 1 }).lean<ClassRecord[]>().exec();
    const classes = records
      .flatMap((record) => {
        if (typeof record.time !== "string") return [];
        const day = matchWeekDate(record.date, week);
        if (!day || (query.date && query.date !== day.isoDate && query.date !== day.dayOfMonth)) return [];
        if (query.category && record.category !== query.category) return [];
        return [toFitnessClass(record, day.isoDate)];
      })
      .filter((d) => getTimeSortValue(d.time) != -1)
      .sort((first, second) => {
        const dateOrder = first.date.localeCompare(second.date);
        if (dateOrder) return dateOrder;

        const timeOrder = getTimeSortValue(first.time) - getTimeSortValue(second.time);
        return timeOrder || first.time.localeCompare(second.time);
      });
    const firstDay = week[0].date;
    const lastDay = week[6].date;

    return {
      weekLabel: formatWeekLabel(firstDay, lastDay),
      days: week.map(({ isoDate, label, isToday }) => ({
        label,
        date: isoDate,
        ...(isToday ? { isToday: true } : {}),
      })),
      classes,
    };
  }

  async getById(id: FitnessClass["id"]): Promise<FitnessClass | null> {
    if (!isObjectIdOrHexString(id)) return null;
    await connectDB();
    const record = await FitnessClassModel.findOne({ _id: id }).lean<ClassRecord>().exec();
    return record ? toFitnessClass(record) : null;
  }
}

export const classRepository: ClassRepository = new MongoClassRepository();
