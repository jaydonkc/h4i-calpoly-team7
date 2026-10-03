"use client";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import ClassCard from "@/components/classes/ClassCard";
import Icon from "@/components/classes/Icon";
import MultiSelectFilter from "@/components/classes/MultiSelectFilter";
import { classCategories, type ClassCategory, type ClassSchedule } from "@/types/fitness-class";
type FilterMenu = "categories" | "durations" | "levels" | "instructors";
type FilterDimension = "category" | "duration" | "level" | "instructor";

export default function ClassesPage({ initialSchedule }: { initialSchedule: ClassSchedule }) {
  const today = initialSchedule.days.find((item) => item.isToday)?.date ?? initialSchedule.days[0]?.date ?? "";
  const [day, setDay] = useState(today),
    [draftCategories, setDraftCategories] = useState<ClassCategory[]>([]),
    [draftDurations, setDraftDurations] = useState<string[]>([]),
    [draftLevels, setDraftLevels] = useState<string[]>([]),
    [draftInstructors, setDraftInstructors] = useState<string[]>([]),
    [appliedCategories, setAppliedCategories] = useState<ClassCategory[]>([]),
    [appliedDurations, setAppliedDurations] = useState<string[]>([]),
    [appliedLevels, setAppliedLevels] = useState<string[]>([]),
    [appliedInstructors, setAppliedInstructors] = useState<string[]>([]),
    [openFilter, setOpenFilter] = useState<FilterMenu | null>(null);
  const classes = useMemo(() => {
    const list = initialSchedule.classes.filter((item) => item.date === day);
    return list.filter(
      (item) =>
        (appliedCategories.length === 0 || appliedCategories.includes(item.category)) &&
        (appliedDurations.length === 0 || appliedDurations.includes(item.duration)) &&
        (appliedLevels.length === 0 || appliedLevels.includes(item.level)) &&
        (appliedInstructors.length === 0 || appliedInstructors.includes(item.coach)),
    );
  }, [day, appliedCategories, appliedDurations, appliedLevels, appliedInstructors, initialSchedule.classes]);

  const durations = useMemo(
    () => Array.from(new Set(initialSchedule.classes.map((item) => item.duration))),
    [initialSchedule.classes],
  );
  const levels = useMemo(
    () => Array.from(new Set(initialSchedule.classes.map((item) => item.level))),
    [initialSchedule.classes],
  );
  const instructors = useMemo(
    () => Array.from(new Set(initialSchedule.classes.map((item) => item.coach))),
    [initialSchedule.classes],
  );

  function toggleCategory(category: ClassCategory) {
    setDraftCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  function applyFilters() {
    setAppliedCategories(draftCategories);
    setAppliedDurations(draftDurations);
    setAppliedLevels(draftLevels);
    setAppliedInstructors(draftInstructors);
    setOpenFilter(null);
  }

  function toggleFilter(filter: FilterMenu) {
    setOpenFilter((current) => (current === filter ? null : filter));
  }

  function toggleValue(value: string, setValues: Dispatch<SetStateAction<string[]>>) {
    setValues((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function getFacetCount(dimension: FilterDimension, value: string) {
    return initialSchedule.classes.filter((item) => {
      if (item.date !== day) return false;

      const matchesCategory =
        dimension === "category"
          ? item.category === value
          : draftCategories.length === 0 || draftCategories.includes(item.category);
      const matchesDuration =
        dimension === "duration"
          ? item.duration === value
          : draftDurations.length === 0 || draftDurations.includes(item.duration);
      const matchesLevel =
        dimension === "level" ? item.level === value : draftLevels.length === 0 || draftLevels.includes(item.level);
      const matchesInstructor =
        dimension === "instructor"
          ? item.coach === value
          : draftInstructors.length === 0 || draftInstructors.includes(item.coach);

      return matchesCategory && matchesDuration && matchesLevel && matchesInstructor;
    }).length;
  }
  return (
    <main id="top">
      <header className="classes-header">
        <div className="shell">
          <h1>Classes</h1>
        </div>
      </header>
      <section className="schedule shell" id="schedule">
        <div className="heading">
          <div>
            <small>THIS WEEK</small>
            <h2>{initialSchedule.weekLabel}</h2>
          </div>
          <button className="today" onClick={() => setDay(today)}>
            <Icon name="calendar" /> Jump to today
          </button>
        </div>
        <div className="days" role="tablist">
          {initialSchedule.days.map((x) => (
            <button
              role="tab"
              aria-selected={day === x.date}
              className={day === x.date ? "selected" : ""}
              key={x.date}
              onClick={() => setDay(x.date)}
            >
              <small>{x.label}</small>
              <strong>{x.date}</strong>
              {x.isToday && <i>Today</i>}
            </button>
          ))}
        </div>
        <div className="filterrow">
          <div className="filter-menus">
            <MultiSelectFilter
              label="Class types"
              title="Filter by class type"
              options={classCategories.map((category) => ({
                value: category,
                label: category,
                count: getFacetCount("category", category),
              }))}
              selected={draftCategories}
              onToggle={toggleCategory}
              onClear={() => setDraftCategories([])}
              isOpen={openFilter === "categories"}
              onOpenChange={() => toggleFilter("categories")}
            />
            <MultiSelectFilter
              label="Duration"
              title="Filter by duration"
              options={durations.map((duration) => ({
                value: duration,
                label: duration,
                count: getFacetCount("duration", duration),
              }))}
              selected={draftDurations}
              onToggle={(value) => toggleValue(value, setDraftDurations)}
              onClear={() => setDraftDurations([])}
              isOpen={openFilter === "durations"}
              onOpenChange={() => toggleFilter("durations")}
            />
            <MultiSelectFilter
              label="Difficulty"
              title="Filter by difficulty"
              options={levels.map((level) => ({
                value: level,
                label: level,
                count: getFacetCount("level", level),
              }))}
              selected={draftLevels}
              onToggle={(value) => toggleValue(value, setDraftLevels)}
              onClear={() => setDraftLevels([])}
              isOpen={openFilter === "levels"}
              onOpenChange={() => toggleFilter("levels")}
            />
            <MultiSelectFilter
              label="Instructor"
              title="Filter by instructor"
              options={instructors.map((instructor) => ({
                value: instructor,
                label: instructor,
                count: getFacetCount("instructor", instructor),
              }))}
              selected={draftInstructors}
              onToggle={(value) => toggleValue(value, setDraftInstructors)}
              onClear={() => setDraftInstructors([])}
              isOpen={openFilter === "instructors"}
              onOpenChange={() => toggleFilter("instructors")}
            />
            <button type="button" className="apply-filters" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
          <span>
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </span>
        </div>
        {classes.length ? (
          <div className="classlist">
            <div className="class-table-header" aria-hidden="true">
              <span>Time</span>
              <span>Class</span>
              <span>Instructor</span>
              <span>Location</span>
              <span>Duration</span>
              <span>Difficulty</span>
              <span>Availability</span>
              <span />
            </div>
            {classes.map((fitnessClass) => (
              <ClassCard key={fitnessClass.id} fitnessClass={fitnessClass} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <b className="sleep-icon" aria-hidden="true">
              <span>z</span>
              <span>z</span>
              <span>z</span>
            </b>
            <h3>Rest day, for now.</h3>
            <p>There aren’t any matching classes on this day. Try another day or reset your filter.</p>
          </div>
        )}
      </section>
      <footer className="shell">
        <p>Move well. Live loud.</p>
        <span>© 2026 Fitness Maxxing</span>
      </footer>
    </main>
  );
}
