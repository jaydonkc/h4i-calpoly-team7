"use client";

type FilterOption<T extends string> = {
  value: T;
  label: string;
  count: number;
};

type MultiSelectFilterProps<T extends string> = {
  label: string;
  title: string;
  options: FilterOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
};

export default function MultiSelectFilter<T extends string>({
  label,
  title,
  options,
  selected,
  onToggle,
  onClear,
  isOpen,
  onOpenChange,
}: MultiSelectFilterProps<T>) {
  return (
    <details className={`filter-menu ${isOpen ? "open" : ""}`} open={isOpen}>
      <summary
        className="filter-trigger"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.preventDefault();
          onOpenChange();
        }}
      >
        <span>{label}</span>
        {selected.length > 0 && <b>{selected.length}</b>}
        <i aria-hidden="true">
          <span className="arrow-down">▾</span>
          <span className="arrow-up">▴</span>
        </i>
      </summary>
      {isOpen && (
        <div className="filter-options">
          <div className="filter-title">
            <strong>{title}</strong>
            {selected.length > 0 && (
              <button type="button" onClick={onClear}>
                Clear
              </button>
            )}
          </div>
          {options.map((option) => {
            const isSelected = selected.includes(option.value);

            return (
              <button
                type="button"
                className="filter-option"
                role="checkbox"
                aria-checked={isSelected}
                key={option.value}
                onClick={() => onToggle(option.value)}
              >
                <span className={`filter-checkbox ${isSelected ? "checked" : ""}`} aria-hidden="true">
                  {isSelected && "✓"}
                </span>
                <span>{option.label}</span>
                <small>{option.count}</small>
              </button>
            );
          })}
        </div>
      )}
    </details>
  );
}
