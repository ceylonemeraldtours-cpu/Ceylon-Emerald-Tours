import { resolveBookingTarget, validateBooking } from "@/lib/booking";
import { sendBookingEmails } from "@/lib/email";
import { handleFormPost } from "@/lib/formApi";
import { createRateLimiter } from "@/lib/rateLimit";
import { oneLine } from "@/lib/validation";

export const runtime = "nodejs"; // Nodemailer needs Node APIs
export const dynamic = "force-dynamic";

// Tour package booking requests: 5 per 10 minutes per IP.
const isLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

export async function POST(req: Request) {
  return handleFormPost({
    req,
    isLimited,
    kind: "booking",
    label: "api/contact",
    parse: (body) => {
      const packageId = oneLine((body as Record<string, unknown> | null)?.packageId, 80);
      const target = packageId ? resolveBookingTarget(packageId) : null;
      if (!target) {
        return {
          ok: false,
          message: "That package could not be found.",
          errors: { packageId: "Unknown package." },
        };
      }
      const result = validateBooking(body, target);
      if (!result.ok) return { ok: false, errors: result.errors as Record<string, string> };
      return { ok: true, data: { guest: result.data, target } };
    },
    send: ({ guest, target }, reference) =>
      sendBookingEmails({ reference, target, guest, submittedAt: new Date() }),
  });
}
