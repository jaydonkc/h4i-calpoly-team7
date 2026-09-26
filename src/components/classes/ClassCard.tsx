import type { FitnessClass } from "@/types/fitness-class";
import Icon from "./Icon";

type ClassCardProps = {
  fitnessClass: FitnessClass;
  onViewDetails: (fitnessClass: FitnessClass) => void;
};

export default function ClassCard({ fitnessClass, onViewDetails }: ClassCardProps) {
  return (
    <article className="classcard">
      <div className={`time ${fitnessClass.color}`}>
        <strong>{fitnessClass.time}</strong>
        <span>{fitnessClass.duration}</span>
      </div>
      <div className="classmain">
        <div>
          <mark className={fitnessClass.color}>{fitnessClass.category}</mark>
          {fitnessClass.spots <= 4 && <small>Only {fitnessClass.spots} spots left</small>}
        </div>
        <h3>{fitnessClass.title}</h3>
        <p className="meta">
          <span>
            <Icon name="user" />
            {fitnessClass.coach}
          </span>
          <span>
            <Icon name="pin" />
            {fitnessClass.room}
          </span>
          <span>
            <Icon name="clock" />
            {fitnessClass.level}
          </span>
        </p>
      </div>
      <button className="details" onClick={() => onViewDetails(fitnessClass)}>
        View details <Icon name="arrow" />
      </button>
    </article>
  );
}
