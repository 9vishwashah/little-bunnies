import { ablepayHash } from "./hash";

function getConfig() {
  const apiKey = process.env.ABLEPAY_API_KEY;
  const salt = process.env.ABLEPAY_SALT;
  const pgUrl = process.env.ABLEPAY_PG_URL;
  if (!apiKey || !salt || !pgUrl) {
    throw new Error("AblePay is not configured: missing ABLEPAY_API_KEY / ABLEPAY_SALT / ABLEPAY_PG_URL");
  }
  // Defaults to TEST so a missing/blank env var can never accidentally take
  // real payments — ABLEPAY_MODE must be explicitly set to LIVE to go live.
  const mode = process.env.ABLEPAY_MODE === "LIVE" ? "LIVE" : "TEST";
  return { apiKey, salt, baseUrl: `https://${pgUrl}`, mode };
}

async function postForm(url: string, params: Record<string, unknown>): Promise<unknown> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    body.set(key, String(value));
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.json();
}

export interface AblepayCustomer {
  orderId: string;
  amount: number;
  description: string;
  name: string;
  email?: string | null;
  phone: string;
  addressLine1?: string;
  city: string;
  state?: string;
  zipCode: string;
  returnUrl: string;
  returnUrlFailure?: string;
  returnUrlCancel?: string;
}

export interface GetPaymentRequestUrlResult {
  url: string;
  uuid: string;
  expiry_datetime: string;
  order_id: string;
}

/**
 * "Get Payment Request URL" (two-step) API — our server calls AblePay,
 * gets back a hosted-checkout URL, and we redirect the customer's browser
 * there. Preferred over the raw auto-submitting-HTML-form flow since it's a
 * plain server-to-server JSON call, matching the rest of this codebase's
 * checkout routes.
 */
export async function getPaymentRequestUrl(customer: AblepayCustomer): Promise<GetPaymentRequestUrlResult> {
  const { apiKey, salt, baseUrl, mode } = getConfig();

  const params = {
    api_key: apiKey,
    order_id: customer.orderId,
    mode,
    amount: customer.amount.toFixed(2),
    currency: "INR",
    description: customer.description,
    name: customer.name,
    email: customer.email || "",
    phone: customer.phone,
    address_line_1: customer.addressLine1 || "",
    city: customer.city,
    state: customer.state || "",
    country: "IND",
    zip_code: customer.zipCode,
    return_url: customer.returnUrl,
    return_url_failure: customer.returnUrlFailure || customer.returnUrl,
    return_url_cancel: customer.returnUrlCancel || customer.returnUrl,
  };

  const hash = ablepayHash(salt, params);
  const result = (await postForm(`${baseUrl}/v2/getpaymentrequesturl`, { ...params, hash })) as {
    data?: GetPaymentRequestUrlResult;
    error?: { code: number | string; message: string };
  };

  if (!result.data) {
    throw new Error(result.error?.message || "AblePay did not return a payment URL");
  }
  return result.data;
}

export interface AblepayStatusResult {
  transaction_id: string;
  response_code: number;
  response_message: string;
  order_id: string;
  amount: string;
  [key: string]: unknown;
}

/** Reconciliation / fallback check — same purpose as Razorpay's payment.fetch. */
export async function getPaymentStatus(orderId: string): Promise<AblepayStatusResult[]> {
  const { apiKey, salt, baseUrl } = getConfig();
  const params = { api_key: apiKey, order_id: orderId };
  const hash = ablepayHash(salt, params);
  const result = (await postForm(`${baseUrl}/v2/paymentstatus`, { ...params, hash })) as {
    data?: AblepayStatusResult[];
    error?: { code: number | string; message: string };
  };
  if (!result.data) {
    throw new Error(result.error?.message || "AblePay status lookup failed");
  }
  return result.data;
}

export interface RefundResult {
  transaction_id: string;
  refund_id: number;
  refund_reference_no: string | null;
}

export async function requestRefund(
  transactionId: string,
  amount: number,
  description: string,
  merchantRefundId?: string
): Promise<RefundResult> {
  const { apiKey, salt, baseUrl } = getConfig();
  const params = {
    api_key: apiKey,
    transaction_id: transactionId,
    merchant_refund_id: merchantRefundId || "",
    amount: amount.toFixed(2),
    description,
  };
  const hash = ablepayHash(salt, params);
  const result = (await postForm(`${baseUrl}/v2/refundrequest`, { ...params, hash })) as {
    data?: RefundResult;
    error?: { code: number | string; message: string };
  };
  if (!result.data) {
    throw new Error(result.error?.message || "AblePay refund request failed");
  }
  return result.data;
}
