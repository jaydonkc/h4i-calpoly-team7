import "./info.css";
import "../globals.css";

export default function GymInfoPage() {
  return (
    <main>
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
        </div>
      </div>
    </main>
  );
}
