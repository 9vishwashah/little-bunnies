"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping } from "@/lib/utils";
import { Check, MapPin, Package, CreditCard } from "lucide-react";
import { toast } from "sonner";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit Indian mobile number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Review", icon: Package },
  { id: 3, label: "Payment", icon: CreditCard },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");
  const [orderLoading, setOrderLoading] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();

  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });


  const onAddressSubmit = (data: AddressFormData) => {
    setAddress(data);
    setStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) return;
    setOrderLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          paymentMethod,
          subtotal,
          shippingAmount: shipping,
          total,
        }),
      });
      const data = await res.json();
      if (data.orderId) {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      } else {
        throw new Error(data.error || "Order creation failed");
      }
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  // Run only on client side after hydration
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // Rehydrate the persisted store
    useCartStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.push("/cart");
    }
  }, [isHydrated, items.length, router]);

  if (!isHydrated || items.length === 0) {
    return null;
  }

  return (
    <div className="section-container py-8 md:py-12 max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10 max-w-sm mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.id
                    ? "bg-sage text-white"
                    : step === s.id
                    ? "bg-ink text-cream"
                    : "bg-cream-dark text-ink-muted"
                }`}
              >
                {step > s.id ? <Check size={16} /> : s.id}
              </div>
              <span className={`text-xs font-semibold ${step === s.id ? "text-ink" : "text-ink-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                  step > s.id ? "bg-sage" : "bg-cream-dark"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-brand shadow-card p-6"
            >
              <h2 className="font-display font-semibold text-ink text-xl mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-ink-muted" />
                Delivery Address
              </h2>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Full Name *</label>
                    <input {...register("fullName")} className="input-brand" placeholder="John Doe" />
                    {errors.fullName && <p className="text-xs text-blush mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Mobile Number *</label>
                    <input
                      {...register("phone")}
                      className="input-brand"
                      placeholder="9876543210"
                      maxLength={10}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onInput={(e) => {
                        // Strip non-digits on input for safety
                        const el = e.currentTarget;
                        el.value = el.value.replace(/\D/g, "");
                      }}
                    />
                    {errors.phone && <p className="text-xs text-blush mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Address Line 1 *</label>
                  <input {...register("addressLine1")} className="input-brand" placeholder="House No., Street, Area" />
                  {errors.addressLine1 && <p className="text-xs text-blush mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Address Line 2</label>
                  <input {...register("addressLine2")} className="input-brand" placeholder="Landmark, Apartment (optional)" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">City *</label>
                    <input {...register("city")} className="input-brand" placeholder="Mumbai" />
                    {errors.city && <p className="text-xs text-blush mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">State *</label>
                    <select {...register("state")} className="input-brand">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs text-blush mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Pincode *</label>
                    <input {...register("pincode")} className="input-brand" placeholder="400001" maxLength={6} />
                    {errors.pincode && <p className="text-xs text-blush mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 mt-2">
                  Continue to Review →
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && address && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Address summary */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                    <MapPin size={16} className="text-ink-muted" />
                    Delivery to
                  </h3>
                  <button onClick={() => setStep(1)} className="text-sm font-semibold text-ink-muted hover:text-ink">
                    Edit
                  </button>
                </div>
                <p className="font-semibold text-ink">{address.fullName}</p>
                <p className="text-sm text-ink-muted mt-0.5">
                  {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-sm text-ink-muted">
                  {address.city}, {address.state} — {address.pincode}
                </p>
                <p className="text-sm text-ink-muted">📞 {address.phone}</p>
              </div>

              {/* Items */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                  <Package size={16} className="text-ink-muted" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant?.id}`} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink line-clamp-1">{item.name}</p>
                        {item.variant && <p className="text-xs text-ink-muted">{item.variant.value}</p>}
                        <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-ink text-sm">
                        {formatPrice((item.price + (item.variant?.price_modifier || 0)) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-ink-muted" />
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-ink cursor-pointer">
                    <input type="radio" checked readOnly className="accent-ink" />
                    <div>
                      <p className="font-semibold text-ink text-sm">Cash on Delivery (COD)</p>
                      <p className="text-xs text-ink-muted">Pay when your order arrives</p>
                    </div>
                    <span className="ml-auto badge-new">Available</span>
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-ink/15 opacity-50 cursor-not-allowed">
                    <input type="radio" disabled className="accent-ink" />
                    <div>
                      <p className="font-semibold text-ink text-sm">Online Payment</p>
                      <p className="text-xs text-ink-muted">UPI / Card / Net Banking (Coming soon)</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="btn-primary w-full py-4 text-base"
              >
                {orderLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  "Place Order (COD)"
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-white rounded-brand shadow-card p-5 sticky top-28">
            <h3 className="font-display font-semibold text-ink text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-light font-medium">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-light font-medium">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-sage-dark font-semibold" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-ink text-base pt-3 border-t border-ink/8 mt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="text-xs text-ink-muted mt-3 text-center">GST included • Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
