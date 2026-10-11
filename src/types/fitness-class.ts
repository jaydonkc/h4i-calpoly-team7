export const classCategories = ["Strength", "Cardio", "Mind & Body"] as const;
export type ClassCategory = (typeof classCategories)[number];

export type FitnessClass = {
  id: number | string;
  date: string;
  title: string;
  category: ClassCategory;
  time: string;
  end: string;
  coach: string;
  room: string;
  level: string;
  duration: string;
  spots: number;
  description: string;
};

export type ClassSchedule = {
  weekLabel: string;
  days: Array<{ label: string; date: string; isToday?: boolean }>;
  classes: FitnessClass[];
};

export type ClassQuery = { date?: string; category?: ClassCategory };
