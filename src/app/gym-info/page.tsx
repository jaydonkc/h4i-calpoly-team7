import "./info.css";
import "../globals.css";
import Link from "next/link";

export default function GymInfoPage() {
  return (
    <main className="fitness-page">
      <div className="fitness-logo top-logo" aria-hidden="true">
        <span className="fitness-logo-mark">FM</span>
        <span className="fitness-logo-name">
          Fitness
          <br />
          Maxxing
        </span>
      </div>

      <div className="fitness-actions">
        <Link className="account-button" href="/profile">
          Account
        </Link>
      </div>

      <div className="info about-info">
        <h1>About Our Gym</h1>
        <div className="gym-details" tabIndex={0}>
          Welcome to Fitness Maxxing, a friendly space where people of all fitness levels can work toward their health
          and wellness goals.
        </div>
      </div>

      <div className="info offer-info">
        <h1>What We Offer</h1>
        <div className="gym-details" tabIndex={0}>
          <ul>
            <li>Strength and cardio equipment</li>
            <li>Personal training and fitness guidance</li>
            <li>Group workouts for all experience levels</li>
            <li>A clean and welcoming environment</li>
          </ul>
        </div>
      </div>

      <div className="info visit-info">
        <h1>Visit Us</h1>
        <div className="gym-details" tabIndex={0}>
          <p>Stop by during our open hours to take a tour, meet our team, and learn more about becoming a member.</p>
          <p>
            <strong>Hours:</strong> Monday-Friday, 5:00 AM-10:00 PM; Saturday-Sunday, 7:00 AM-8:00 PM
          </p>
          <p>
            <strong>Sample locations:</strong> Downtown Fitness Maxxing, 123 Main Street; Northside Fitness Maxxing, 456
            Oak Avenue
          </p>
        </div>
      </div>

      <footer className="fitness-footer">
        <div className="fitness-logo" aria-label="Fitness Maxxing">
          <span className="fitness-logo-mark">FM</span>
          <span className="fitness-logo-name">
            Fitness
            <br />
            Maxxing
          </span>
        </div>
        <p className="fitness-slogan">Stronger every day.</p>
        <p className="fitness-copyright">© 2026 Fitness Maxxing</p>
      </footer>
    </main>
  );
}
