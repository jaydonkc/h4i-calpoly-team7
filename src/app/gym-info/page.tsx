import "./info.css";
import "../globals.css";

export default function GymInfoPage() {
  return (
    <main className="fitness-page">
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

      <section className="info faq-info">
        <h2>Frequently Asked Questions</h2>
        <details>
          <summary>Do I need a membership to visit?</summary>
          <p>No. Visitors can schedule a tour or ask about a day pass at the front desk.</p>
        </details>
        <details>
          <summary>Do you offer personal training?</summary>
          <p>Yes. Our trainers can help create a fitness plan based on your goals and experience.</p>
        </details>
        <details>
          <summary>Can beginners join?</summary>
          <p>Absolutely. Our equipment, classes, and staff support members at every fitness level.</p>
        </details>
      </section>
    </main>
  );
}
