import { calculateTotal, resolveBookingTarget, validateBooking } from "@/lib/booking";
import { handleFormPost } from "@/lib/formApi";
import { sendBookingEmails } from "@/lib/mail";
import { createRateLimiter } from "@/lib/rateLimit";
import { oneLine } from "@/lib/validation";

export const runtime = "nodejs"; // Nodemailer needs Node APIs
export const dynamic = "force-dynamic";

// Tour package bookings: 5 per 10 minutes per IP.
const isLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

/**
 * POST /api/booking
 * Body: { packageId, fullName, email, phone, travelDate, adults, pickupLocation?, notes? }
 * The package name and the total price come from the server's tour data, never from the browser.
 * Reference: CET-BK-XXXX
 */
export async function POST(req: Request) {
  return handleFormPost({
    req,
    isLimited,
    kind: "booking",
    label: "api/booking",
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
      sendBookingEmails({
        reference,
        target,
        guest,
        totalPrice: calculateTotal(target, guest.adults),
        submittedAt: new Date(),
      }),
  });
}
