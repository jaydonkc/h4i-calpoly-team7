export default function ClassesLoading() {
  return (
    <section className="schedule shell classes-loading" aria-busy="true" aria-label="Class schedule">
      <p className="loading-status" role="status">
        Loading class schedule…
      </p>
      <div aria-hidden="true">
        <div className="heading">
          <div>
            <small>THIS WEEK</small>
            <div className="schedule-placeholder loading-week" />
          </div>
          <div className="schedule-placeholder loading-today" />
        </div>
        <div className="days loading-days">
          {Array.from({ length: 7 }, (_, index) => (
            <div className="loading-day" key={index}>
              <span className="schedule-placeholder" />
              <span className="schedule-placeholder" />
            </div>
          ))}
        </div>
        <div className="filterrow">
          <div className="filter-menus">
            {["Class types", "Duration", "Difficulty", "Instructor", "Location", "Apply Filters"].map((label) => (
              <button type="button" className="filter-trigger" disabled key={label}>
                {label}
              </button>
            ))}
          </div>
          <span className="schedule-placeholder loading-count" />
        </div>
        <div className="classlist">
          <div className="class-table-header">
            {["Time", "Class", "Instructor", "Location", "Duration", "Difficulty", "Availability", ""].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          {Array.from({ length: 3 }, (_, row) => (
            <div className="classcard" key={row}>
              {["Time", "Class", "Instructor", "Location", "Duration", "Difficulty", "Availability", "Reserve"].map(
                (label) => (
                  <div className={`table-cell${label === "Class" ? " classmain" : ""}`} data-label={label} key={label}>
                    <span className="schedule-placeholder loading-cell" />
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
