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
  coachId?: string;
  room: string;
  location?: string;
  level: string;
  duration: string;
  spots: number;
  capacity?: number;
  description: string;
};

export type ClassSchedule = {
  weekLabel: string;
  days: Array<{ label: string; date: string; isToday?: boolean }>;
  classes: FitnessClass[];
};

export type ClassQuery = { weekStart?: string; date?: string; category?: ClassCategory };
