import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export type PaymentRecord = {
  id: string;
  user_id?: string | null;
  merchant_reference: string;
  provider_reference?: string | null;
  buyer_name?: string;
  buyer_department?: string;
  ticket_number?: string | null;
  amount_minor: number;
  organizer_proceeds_minor?: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  checkout_url?: string | null;
  initiated_at?: string;
  created_at?: string;
  verified_at?: string | null;
  failed_at?: string | null;
};

export type PaymentEventRecord = {
  id: string;
  event_key: string;
  event_type: string;
  merchant_reference?: string | null;
  provider_reference?: string | null;
  signature_valid: boolean;
  status: string;
  created_at: string;
  raw_payload?: any;
};

const DATA_DIR = join(process.cwd(), ".local-db");
const PAYMENTS_FILE = join(DATA_DIR, "payments.json");
const EVENTS_FILE = join(DATA_DIR, "payment-events.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readLocalPayments(): PaymentRecord[] {
  ensureDir();
  if (!existsSync(PAYMENTS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(PAYMENTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function writeLocalPayments(payments: PaymentRecord[]) {
  ensureDir();
  writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), "utf8");
}

export function readLocalEvents(): PaymentEventRecord[] {
  ensureDir();
  if (!existsSync(EVENTS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(EVENTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function writeLocalEvents(events: PaymentEventRecord[]) {
  ensureDir();
  writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
}

export class LocalSupabaseAdminClient {
  from(table: string) {
    if (table !== "payments") {
      return {
        select: () => this,
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        eq: () => this,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      };
    }

    return new LocalPaymentsQueryBuilder();
  }

  async rpc(fnName: string, args: Record<string, any>) {
    if (fnName === "finalize_verified_payment") {
      const payments = readLocalPayments();
      const payment = payments.find((p) => p.id === args.p_payment_id);
      if (!payment) {
        return { data: null, error: new Error("payment_not_found") };
      }
      if (payment.status === "successful") {
        return { data: payment, error: null };
      }

      let ticketNumber = payment.ticket_number;
      if (!ticketNumber) {
        const base = `TKT-${payment.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;
        const qty = Math.max(1, Math.round(Number(payment.amount_minor || 20000) / 20000));
        if (qty > 1) {
          ticketNumber = Array.from({ length: qty }, (_, i) => `${base}-${i + 1}`).join(", ");
        } else {
          ticketNumber = base;
        }
      }

      payment.status = "successful";
      payment.provider_reference = args.p_provider_reference || payment.provider_reference;
      payment.ticket_number = ticketNumber;
      payment.verified_at = new Date().toISOString();
      payment.failed_at = null;

      writeLocalPayments(payments);
      return { data: payment, error: null };
    }

    if (fnName === "record_payment_event") {
      const events = readLocalEvents();
      const exists = events.some((e) => e.event_key === args.p_event_key);
      if (exists) {
        return { data: false, error: null }; // duplicate
      }
      events.push({
        id: randomUUID(),
        event_key: args.p_event_key,
        event_type: args.p_event_type,
        merchant_reference: args.p_merchant_reference,
        provider_reference: args.p_provider_reference,
        signature_valid: args.p_signature_valid,
        status: "pending",
        created_at: new Date().toISOString(),
        raw_payload: args.p_raw_payload
      });
      writeLocalEvents(events);
      return { data: true, error: null };
    }

    if (fnName === "finish_payment_event") {
      const events = readLocalEvents();
      const event = events.find((e) => e.event_key === args.p_event_key);
      if (event) {
        event.status = args.p_processing_error ? "failed" : "completed";
        writeLocalEvents(events);
      }
      return { data: true, error: null };
    }

    if (fnName === "get_organizer_overview") {
      const payments = readLocalPayments();
      const successful = payments.filter((p) => p.status === "successful");
      return {
        data: {
          successful_tickets: successful.length,
          total_customer_payments_minor: successful.reduce((sum, p) => sum + (p.amount_minor || 0), 0),
          organizer_payout_minor: successful.reduce(
            (sum, p) => sum + (p.organizer_proceeds_minor || 0),
            0
          ),
          pending_tickets: payments.filter((p) => p.status === "pending").length
        },
        error: null
      };
    }

    return { data: null, error: null };
  }
}

class LocalPaymentsQueryBuilder {
  private filters: Array<(p: PaymentRecord) => boolean> = [];
  private insertedData: Partial<PaymentRecord> | null = null;
  private updatedData: Partial<PaymentRecord> | null = null;

  select(fields?: string) {
    return this;
  }

  insert(data: Partial<PaymentRecord>) {
    const record: PaymentRecord = {
      id: data.id || randomUUID(),
      merchant_reference: data.merchant_reference || "",
      provider_reference: data.provider_reference || null,
      buyer_name: data.buyer_name || "",
      buyer_department: data.buyer_department || "",
      ticket_number: data.ticket_number || null,
      amount_minor: Number(data.amount_minor || 0),
      organizer_proceeds_minor: Number(data.organizer_proceeds_minor || 0),
      currency: data.currency || "NGN",
      status: (data.status as any) || "pending",
      checkout_url: data.checkout_url || null,
      initiated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      verified_at: null,
      failed_at: null
    };

    const payments = readLocalPayments();
    payments.push(record);
    writeLocalPayments(payments);

    this.insertedData = record;
    return this;
  }

  update(patch: Partial<PaymentRecord>) {
    this.updatedData = patch;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((p) => (p as any)[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((p) => values.includes((p as any)[column]));
    return this;
  }

  limit(n: number) {
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    return this;
  }

  async single() {
    if (this.insertedData) {
      return { data: this.insertedData, error: null };
    }
    const result = await this.execute();
    if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
      return { data: null, error: new Error("Row not found.") };
    }
    const item = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: item, error: null };
  }

  async maybeSingle() {
    if (this.insertedData) {
      return { data: this.insertedData, error: null };
    }
    const result = await this.execute();
    const item = Array.isArray(result.data) ? (result.data[0] ?? null) : result.data;
    return { data: item, error: null };
  }

  then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    return this.execute().then(resolve, reject);
  }

  private async execute() {
    let payments = readLocalPayments();

    if (this.updatedData) {
      const patch = this.updatedData;
      let updatedCount = 0;
      payments = payments.map((p) => {
        const matches = this.filters.every((f) => f(p));
        if (matches) {
          updatedCount++;
          return { ...p, ...patch };
        }
        return p;
      });
      writeLocalPayments(payments);
      return { data: null, error: null };
    }

    const filtered = payments.filter((p) => this.filters.every((f) => f(p)));
    return { data: filtered, error: null };
  }
}
