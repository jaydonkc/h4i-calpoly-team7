"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/components/AuthProvider";
import ClassCard from "@/components/classes/ClassCard";
import Icon from "@/components/classes/Icon";
import MultiSelectFilter from "@/components/classes/MultiSelectFilter";
import { classCategories, type ClassCategory, type ClassSchedule } from "@/types/fitness-class";
type FilterMenu = "categories" | "durations" | "levels" | "instructors";
type FilterDimension = "category" | "duration" | "level" | "instructor";

type ClassesPageProps = {
  initialSchedule: ClassSchedule;
  errorMessage?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
};

export default function ClassesPage({ initialSchedule, errorMessage = null, onRetry, onRefresh }: ClassesPageProps) {
  const router = useRouter();
  const { preferences, profileLoading, profileError, user, isLoading, reservationsError, retryAccount } = useAuth();
  const preferenceApplied = useRef<string | null | undefined>(undefined);
  const returnApplied = useRef(false);
  const today = initialSchedule.days.find((item) => item.isToday)?.date ?? initialSchedule.days[0]?.date ?? "";
  const classList = initialSchedule.classes;

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
  useEffect(() => {
    if (isLoading || profileLoading || profileError || preferenceApplied.current === (user?.id ?? null)) return;
    const categories = preferences.defaultClassCategory === "All" ? [] : [preferences.defaultClassCategory];
    setDraftCategories(categories);
    setAppliedCategories(categories);
    preferenceApplied.current = user?.id ?? null;
  }, [isLoading, profileLoading, profileError, user?.id, preferences.defaultClassCategory]);
  useEffect(() => {
    if (profileLoading || !initialSchedule.days.length || returnApplied.current) return;
    returnApplied.current = true;
    const query = new URLSearchParams(window.location.search);
    const requestedDay = query.get("day");
    if (initialSchedule.days.some((item) => item.date === requestedDay)) setDay(requestedDay!);
    // Return to the selected class even if the saved default filter would hide it.
    if (query.has("class")) {
      setAppliedCategories([]);
      setDraftCategories([]);
    }
  }, [initialSchedule.days, profileLoading]);
  const classes = useMemo(() => {
    const list = classList.filter((item) => item.date === day);
    return list.filter(
      (item) =>
        (appliedCategories.length === 0 || appliedCategories.includes(item.category)) &&
        (appliedDurations.length === 0 || appliedDurations.includes(item.duration)) &&
        (appliedLevels.length === 0 || appliedLevels.includes(item.level)) &&
        (appliedInstructors.length === 0 || appliedInstructors.includes(item.coach)),
    );
  }, [day, appliedCategories, appliedDurations, appliedLevels, appliedInstructors, classList]);

  const durations = useMemo(
    () =>
      Array.from(new Set(initialSchedule.classes.map((item) => item.duration))).sort(
        (a, b) => parseInt(a) - parseInt(b),
      ),
    [initialSchedule.classes],
  );
  const levels = useMemo(() => {
    const schedule = ["All levels", "Beginner", "Intermediate", "Advanced"];
    return Array.from(new Set(initialSchedule.classes.map((item) => item.level))).sort((a, b) => {
      return schedule.indexOf(a) - schedule.indexOf(b);
    });
  }, [initialSchedule.classes]);
  const instructors = useMemo(
    () => Array.from(new Set(initialSchedule.classes.map((item) => item.coach))).sort(),
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
    onRefresh?.();
  }

  function toggleFilter(filter: FilterMenu) {
    setOpenFilter((current) => (current === filter ? null : filter));
  }

  function toggleValue(value: string, setValues: Dispatch<SetStateAction<string[]>>) {
    setValues((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function getFacetCount(dimension: FilterDimension, value: string) {
    return classList.filter((item) => {
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
      <div className="classes-back-row">
        <button type="button" className="classes-back-link" onClick={() => router.back()}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>
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
          <button className="today" disabled={!today} onClick={() => setDay(today)}>
            <Icon name="calendar" /> Jump to today
          </button>
        </div>
        <div className="days" role="tablist" aria-label="Schedule dates">
          {initialSchedule.days.map((item) => (
            <button
              role="tab"
              aria-selected={day === item.date}
              className={day === item.date ? "selected" : ""}
              key={item.date}
              onClick={() => setDay(item.date)}
            >
              <small>{item.label}</small>
              <strong>{Number(item.date.slice(-2))}</strong>
              {item.isToday && <i>Today</i>}
            </button>
          ))}
        </div>
        {reservationsError && (
          <p role="alert">
            {reservationsError}{" "}
            <button type="button" onClick={retryAccount}>
              Retry account data
            </button>
          </p>
        )}
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
        ) : errorMessage === "loading" ? (
          <p role="status">Loading Classes...</p>
        ) : (
          <div>
            <p role="alert">{errorMessage}</p>
            <button type="button" className="reload" onClick={onRetry ?? (() => window.location.reload())}>
              Reload
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
