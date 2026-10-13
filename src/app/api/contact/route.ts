import connectDB from "@/database/db";
import ContactMessage from "@/database/contactMessageSchema";
import { accountRoute, readBody, AccountError } from "@/lib/account/http";
import { validateMessage } from "@/lib/account/contact";
export const dynamic = "force-dynamic";
export const POST = accountRoute(async (request, user) => {
  const fields = validateMessage(await readBody(request));
  await connectDB();
  const recent = await ContactMessage.countDocuments({
    userId: user.id,
    createdAt: { $gte: new Date(Date.now() - 60_000) },
  });
  if (recent >= 3) throw new AccountError("Give the front desk a minute before sending another message.", 429);
  const saved = await ContactMessage.create({ ...fields, userId: user.id });
  return { id: saved._id.toString(), message: "Your message is saved in the gym inbox. No email was sent." };
});
