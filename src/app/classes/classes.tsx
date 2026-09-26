"use client";
import { useMemo, useState } from "react";
import ClassCard from "@/components/classes/ClassCard";
import Icon from "@/components/classes/Icon";
import type { ClassSchedule, FitnessClass } from "@/types/fitness-class";

const filters = ["All classes", "Strength", "Cardio", "Mind & Body"] as const;
function Brand() {
  return (
    <a className="brand" href="#top">
      <b>FM</b>
      <span>
        FITNESS
        <br />
        MAXXING
      </span>
    </a>
  );
}
export default function ClassesPage({ initialSchedule }: { initialSchedule: ClassSchedule }) {
  const today = initialSchedule.days.find((item) => item.isToday)?.date ?? initialSchedule.days[0]?.date ?? "";
  const [day, setDay] = useState(today),
    [filter, setFilter] = useState<(typeof filters)[number]>("All classes"),
    [detail, setDetail] = useState<FitnessClass | null>(null),
    [booked, setBooked] = useState<number[]>([]);
  const classes = useMemo(() => {
    const list = initialSchedule.classes.filter((item) => item.date === day);
    return filter === "All classes" ? list : list.filter((x) => x.category === filter);
  }, [day, filter, initialSchedule.classes]);
  return (
    <main id="top">
      <nav className="nav shell">
        <Brand />
        <div className="navlinks">
          <a className="active" href="#schedule">
            Schedule
          </a>
          <a href="#membership">Membership</a>
          <a href="#trainers">Trainers</a>
          <a href="#about">About</a>
        </div>
        <button className="account">
          <i>H</i>
          <span>My account</span>
        </button>
      </nav>
      <header className="hero">
        <div className="shell">
          <p className="eyebrow">— &nbsp;Weekly schedule</p>
          <h1>
            Find your next
            <br />
            <em>best hour.</em>
          </h1>
          <p>Classes that challenge your body, clear your head, and make you want to come back tomorrow.</p>
        </div>
        <div className="stamp">
          SHOW UP<strong>+</strong>FEEL GOOD
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
          <div className="filters">
            {filters.map((x) => (
              <button className={filter === x ? "selected" : ""} key={x} onClick={() => setFilter(x)}>
                {x}
              </button>
            ))}
          </div>
          <span>
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </span>
        </div>
        {classes.length ? (
          <div className="classlist">
            {classes.map((fitnessClass) => (
              <ClassCard key={fitnessClass.id} fitnessClass={fitnessClass} onViewDetails={setDetail} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <b>↗</b>
            <h3>Rest day, for now.</h3>
            <p>
              There aren’t any {filter === "All classes" ? "classes" : filter.toLowerCase() + " classes"} on this day.
              Try another day or reset your filter.
            </p>
            <button
              onClick={() => {
                setDay(today);
                setFilter("All classes");
              }}
            >
              See Monday’s classes
            </button>
          </div>
        )}
      </section>
      <section className="membership" id="membership">
        <div className="shell">
          <div>
            <p className="eyebrow">— &nbsp;Ready when you are</p>
            <h2>
              Your first class
              <br />
              is on us.
            </h2>
          </div>
          <aside>
            <p>New here? Come see what the good kind of tired feels like. No commitment, no pressure.</p>
            <button>
              Claim a free class <Icon name="arrow" />
            </button>
          </aside>
        </div>
      </section>
      <footer className="shell">
        <Brand />
        <p>Move well. Live loud.</p>
        <span>© 2026 Fitness Maxxing</span>
      </footer>
      {detail && (
        <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
          <section className="modal" role="dialog" aria-modal="true">
            <button className="close" aria-label="Close class details" onClick={() => setDetail(null)}>
              <Icon name="close" />
            </button>
            <mark className={detail.color}>{detail.category}</mark>
            <h2>{detail.title}</h2>
            <p>{detail.description}</p>
            <div className="modalgrid">
              <div>
                <Icon name="clock" />
                <small>Time</small>
                <b>
                  {detail.time}—{detail.end}
                </b>
              </div>
              <div>
                <Icon name="user" />
                <small>Coach</small>
                <b>{detail.coach}</b>
              </div>
              <div>
                <Icon name="pin" />
                <small>Location</small>
                <b>{detail.room}</b>
              </div>
              <div>
                <Icon name="calendar" />
                <small>Level</small>
                <b>{detail.level}</b>
              </div>
            </div>
            <div className="modalfoot">
              <span>
                <b>{detail.spots}</b> spots remaining
              </span>
              <button
                className={booked.includes(detail.id) ? "booked" : ""}
                onClick={() => setBooked((v) => (v.includes(detail.id) ? v : [...v, detail.id]))}
              >
                {booked.includes(detail.id) ? (
                  <>
                    <Icon name="check" /> You’re booked
                  </>
                ) : (
                  <>
                    Reserve your spot <Icon name="arrow" />
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
