import Link from "next/link";
import "./classes.css";

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="classes-page" id="top">
      <div className="classes-back-row">
        <Link className="classes-back-link" href="/">
          ← Home
        </Link>
      </div>
      <header className="classes-header">
        <div className="shell">
          <h1>Classes</h1>
        </div>
      </header>
      {children}
    </div>
  );
}
