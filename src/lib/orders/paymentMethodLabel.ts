const LABELS: Record<string, string> = {
  ablepay: "Online Payment",
  razorpay: "Razorpay",
  bank_transfer: "Bank Transfer (QR)",
  upi: "UPI",
  cod: "Cash on Delivery",
  cash: "Cash",
};

/** Human-readable label for a payment_method value, used on invoices and in emails. */
export function getPaymentMethodLabel(method: string | null | undefined): string {
  return (method && LABELS[method]) || "Online Payment";
}
