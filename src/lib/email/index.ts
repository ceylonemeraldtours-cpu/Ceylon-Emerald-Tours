import {
  buildBookingEmails,
  buildCustomTourEmails,
  buildTransferEmails,
  type BookingEmailData,
  type CustomTourEmailData,
  type TransferEmailData,
} from "./templates";
import { deliver, type SendResult } from "./transport";

export type { BookingEmailData, CustomTourEmailData, TransferEmailData, SendResult };
export { buildBookingEmails, buildCustomTourEmails, buildTransferEmails };

export const sendBookingEmails = (data: BookingEmailData): Promise<SendResult> =>
  deliver(buildBookingEmails(data), data.guest.email);

export const sendTransferEmails = (data: TransferEmailData): Promise<SendResult> =>
  deliver(buildTransferEmails(data), data.transfer.email);

export const sendCustomTourEmails = (data: CustomTourEmailData): Promise<SendResult> =>
  deliver(buildCustomTourEmails(data), data.plan.email);
