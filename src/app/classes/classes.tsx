"use client";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import ClassCard from "@/components/classes/ClassCard";
import Icon from "@/components/classes/Icon";
import WeekDays from "@/components/classes/WeekDays";
import MultiSelectFilter from "@/components/classes/MultiSelectFilter";
import { classCategories, type ClassCategory, type ClassSchedule } from "@/types/fitness-class";
import { error } from "console";
type FilterMenu = "categories" | "durations" | "levels" | "instructors";
type FilterDimension = "category" | "duration" | "level" | "instructor";

type ClassesPageProps = {
  initialSchedule: ClassSchedule;
  errorMessage?: string | null;
};

export default function ClassesPage({ initialSchedule, errorMessage }: ClassesPageProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const [day, setDay] = useState(today.getDate()),
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
    const list = initialSchedule.classes.filter((item) => Number(item.date.split("-")[2]) === day);
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
      if (Number(item.date.split("-")[2]) !== day) return false;

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
            <h2>
              {formattedDate} - {today.getDate() + 6}
            </h2>
          </div>
          <button className="today" onClick={() => setDay(today.getDate())}>
            <Icon name="calendar" /> Jump to today
          </button>
        </div>
        <div className="days" role="tablist">
          <button
            role="tab"
            aria-selected={day === today.getDate()}
            className={day === today.getDate() ? "selected" : ""}
            onClick={() => setDay(today.getDate())}
          >
            <small>{WeekDays[today.getDay()]}</small>
            <strong>{today.getDate()}</strong>
            <i>Today</i>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 1}
            className={day === today.getDate() + 1 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 1)}
          >
            <small>{WeekDays[(today.getDay() + 1) % 7]}</small>
            <strong>{today.getDate() + 1}</strong>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 2}
            className={day === today.getDate() + 2 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 2)}
          >
            <small>{WeekDays[(today.getDay() + 2) % 7]}</small>
            <strong>{today.getDate() + 2}</strong>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 3}
            className={day === today.getDate() + 3 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 3)}
          >
            <small>{WeekDays[(today.getDay() + 3) % 7]}</small>
            <strong>{today.getDate() + 3}</strong>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 4}
            className={day === today.getDate() + 4 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 4)}
          >
            <small>{WeekDays[(today.getDay() + 4) % 7]}</small>
            <strong>{today.getDate() + 4}</strong>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 5}
            className={day === today.getDate() + 5 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 5)}
          >
            <small>{WeekDays[(today.getDay() + 5) % 7]}</small>
            <strong>{today.getDate() + 5}</strong>
          </button>
          <button
            role="tab"
            aria-selected={day === today.getDate() + 6}
            className={day === today.getDate() + 6 ? "selected" : ""}
            onClick={() => setDay(today.getDate() + 6)}
          >
            <small>{WeekDays[(today.getDay() + 6) % 7]}</small>
            <strong>{today.getDate() + 6}</strong>
          </button>
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
        {errorMessage === null ? (
          classes.length ? (
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
          )
        ) : (
          <div>
            <p>{errorMessage}</p>
            <button type="button" className="reload" onClick={() => window.location.reload()}>
              Reload
            </button>
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
