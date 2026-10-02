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

// Current Active Configuration: Strict ₦200 Test Payment Mode
export const EVENT_CONFIG = {
  name: "Course Representatives' Party Night",
  tagline: "Date and location to be announced.",
  date: "TBA",
  time: "TBA",
  venue: "TBA",
  description:
    "An unforgettable night of music, celebration, good energy, and memories with friends.",
  ticketPriceMinor: 15000, // ₦150 Test Ticket
  processingFeeMinor: 5000, // ₦50 Test Processing Fee
  customerTotalMinor: 20000, // ₦200 Total Charged
  organizerProceedsMinor: 14700,
  currency: "NGN",
  referencePrefix: "PARTY-TEST",
  isTestMode: true
} as const;

export const TICKET_PRICE_DISPLAY = "₦150";
export const PROCESSING_FEE_DISPLAY = "₦50";
export const CUSTOMER_TOTAL_DISPLAY = "₦200";
export const ORGANIZER_PROCEEDS_PER_TICKET_DISPLAY = "₦147";

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
