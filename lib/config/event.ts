// Stored production pricing preset for future live deployment (₦7,000 ticket + ₦500 fee = ₦7,500 total).
export const PRODUCTION_CONFIG_PRESET = {
  ticketPriceMinor: 700000,
  processingFeeMinor: 50000,
  customerTotalMinor: 750000,
  organizerProceedsMinor: 710000,
  ticketPriceDisplay: "₦7,000",
  processingFeeDisplay: "₦500",
  customerTotalDisplay: "₦7,500",
  organizerProceedsDisplay: "₦7,100"
} as const;

// Current Active Configuration: Production Live Pricing
export const EVENT_CONFIG = {
  name: "Course Representatives' Party Night",
  tagline: "Date and location to be announced.",
  date: "TBA",
  time: "TBA",
  venue: "TBA",
  description:
    "An unforgettable night of music, celebration, good energy, and memories with friends.",
  ticketPriceMinor: 700000, // ₦7,000 Ticket
  processingFeeMinor: 50000, // ₦500 Processing Fee
  customerTotalMinor: 750000, // ₦7,500 Total Charged
  organizerProceedsMinor: 710000, // ₦7,100 Organizer Proceeds
  currency: "NGN",
  referencePrefix: "PARTY",
  isTestMode: false
} as const;

export const TICKET_PRICE_DISPLAY = "₦7,000";
export const PROCESSING_FEE_DISPLAY = "₦500";
export const CUSTOMER_TOTAL_DISPLAY = "₦7,500";
export const ORGANIZER_PROCEEDS_PER_TICKET_DISPLAY = "₦7,100";

export function calculateOrderEconomics(quantity: number) {
  const safeQty = Math.max(1, Math.min(10, Math.floor(quantity) || 1));
  const ticketSubtotalMinor = safeQty * EVENT_CONFIG.ticketPriceMinor;
  const processingFeeMinor = safeQty * EVENT_CONFIG.processingFeeMinor;
  const totalMinor = ticketSubtotalMinor + processingFeeMinor;
  const organizerProceedsMinor = safeQty * EVENT_CONFIG.organizerProceedsMinor;

  return {
    quantity: safeQty,
    ticketSubtotalMinor,
    processingFeeMinor,
    totalMinor,
    organizerProceedsMinor,
    ticketSubtotalDisplay: `₦${((ticketSubtotalMinor) / 100).toLocaleString("en-NG")}`,
    processingFeeDisplay: `₦${((processingFeeMinor) / 100).toLocaleString("en-NG")}`,
    totalDisplay: `₦${((totalMinor) / 100).toLocaleString("en-NG")}`
  };
}
