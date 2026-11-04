import { sendTransferEmails } from "@/lib/email";
import { handleFormPost } from "@/lib/formApi";
import { createRateLimiter } from "@/lib/rateLimit";
import { validateTransfer } from "@/lib/transfer";

export const runtime = "nodejs"; // Nodemailer needs Node APIs
export const dynamic = "force-dynamic";

// Airport transfer requests: 5 per 10 minutes per IP.
const isLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

export async function POST(req: Request) {
  return handleFormPost({
    req,
    isLimited,
    kind: "transfer", // reference prefix CET-TR-
    label: "api/transfer",
    parse: (body) => {
      const result = validateTransfer(body);
      return result.ok ? result : { ok: false, errors: result.errors as Record<string, string> };
    },
    send: (transfer, reference) => sendTransferEmails({ reference, transfer, submittedAt: new Date() }),
  });
}
