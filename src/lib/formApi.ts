import { NextResponse } from "next/server";
import { SITE } from "@/lib/constants";
import { clientIp } from "@/lib/rateLimit";
import { generateReference, type ReferenceKind } from "@/lib/reference";
import type { SendResult } from "@/lib/mail";

export type ParseResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; errors: Record<string, string>; message?: string };

interface FormApiOptions<TData> {
  req: Request;
  /** Returns true when this client has sent too many requests. */
  isLimited: (key: string) => boolean;
  kind: ReferenceKind;
  /** Validates the JSON body. Runs after the honeypot check. */
  parse: (body: unknown) => ParseResult<TData>;
  send: (data: TData, reference: string) => Promise<SendResult>;
  /** Used in server logs, e.g. "api/transfer-inquiry". */
  label: string;
}

/**
 * The shared request flow for every form: rate limit, JSON parse, honeypot, validation,
 * reference number, dual email dispatch. Responses always have the shape
 * { ok, reference?, guestEmailSent?, devMode?, message?, errors? }.
 */
export async function handleFormPost<TData>(opts: FormApiOptions<TData>): Promise<NextResponse> {
  if (opts.isLimited(clientIp(opts.req))) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please wait a few minutes or message us on WhatsApp." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await opts.req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success to bots.
  if (typeof body === "object" && body && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true, reference: generateReference(opts.kind), guestEmailSent: true });
  }

  const parsed = opts.parse(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, message: parsed.message ?? "Please check the highlighted fields.", errors: parsed.errors },
      { status: 422 }
    );
  }

  const reference = generateReference(opts.kind);
  try {
    const sent = await opts.send(parsed.data, reference);
    return NextResponse.json({
      ok: true,
      reference,
      guestEmailSent: sent.guestEmailSent,
      devMode: sent.mode === "console",
    });
  } catch (err) {
    console.error(`[${opts.label}] Failed to send emails:`, err);
    return NextResponse.json(
      {
        ok: false,
        message: `We could not send your request just now. Please message us on WhatsApp at ${SITE.phoneDisplay} and we will help right away.`,
      },
      { status: 500 }
    );
  }
}
