import { AccountError, onlyFields } from "./http";
export function validateMessage(body: Record<string, unknown>) {
  onlyFields(body, ["name", "email", "topic", "message"]);
  const text = (field: string, max: number) => {
    const value = typeof body[field] === "string" ? (body[field] as string).trim() : "";
    if (!value || value.length > max) throw new AccountError(`Enter ${field} between 1 and ${max} characters.`);
    return value;
  };
  const name = text("name", 120),
    email = text("email", 254),
    topic = text("topic", 30),
    message = text("message", 3000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AccountError("Enter a valid email address.");
  if (!["memberships", "classes", "locations", "other"].includes(topic))
    throw new AccountError("Choose a listed topic.");
  return { name, email, topic, message };
}
