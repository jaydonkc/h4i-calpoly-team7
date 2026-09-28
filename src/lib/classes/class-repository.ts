import mockSchedule from "@/data/classes.json";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

export interface ClassRepository {
  getSchedule(query?: ClassQuery): Promise<ClassSchedule>;
  getById(id: number): Promise<FitnessClass | null>;
}

class JsonClassRepository implements ClassRepository {
  async getSchedule(query: ClassQuery = {}): Promise<ClassSchedule> {
    const schedule = mockSchedule as ClassSchedule;
    const classes = schedule.classes.filter(
      (item) => (!query.date || item.date === query.date) && (!query.category || item.category === query.category),
    );
    return { ...schedule, classes };
  }

  async getById(id: number): Promise<FitnessClass | null> {
    return (mockSchedule as ClassSchedule).classes.find((item) => item.id === id) ?? null;
  }
}

// UI code depends on this contract, not the JSON source. Replace this instance
// with a database-backed repository without changing page or component code.
export const classRepository: ClassRepository = new JsonClassRepository();
