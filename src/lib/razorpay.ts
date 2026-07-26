import Razorpay from "razorpay";

let instance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured: missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}
