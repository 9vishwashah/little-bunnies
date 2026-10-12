/**
 * Single source of truth for the FAQ content shown on the homepage, the
 * prams & strollers page, the diaper bags page and the /faq help page. The
 * same arrays feed both the visible accordion and the FAQPage JSON-LD, so the
 * markup always matches what visitors can actually read (a Google
 * requirement) — and every answer here is checked against the real
 * shipping/exchange/return policy pages and product specs, not marketing
 * guesses. If a policy changes, change it here (and on the policy page).
 */

export interface Faq {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: "shipping" | "exchanges" | "products" | "payments";
  title: string;
  items: Faq[];
}

const SHIPPING_COST_ANSWER =
  "Shipping is free on orders above ₹5,999 anywhere in India. Below that, a flat ₹99 shipping fee applies.";

const SHIPPING_ANSWER = `${SHIPPING_COST_ANSWER} Standard delivery takes 7–15 business days, and you're notified as soon as your order is dispatched.`;

const EXCHANGE_ANSWER =
  "We don't do refunds or returns — instead, eligible orders can be exchanged within 15 days of delivery (store credit is issued if the replacement costs less). You'll need an unboxing video, and reverse pickup carries a ₹200 logistics fee. Full details are in our Exchange & Credit Note Policy.";

export const HOME_FAQS: Faq[] = [
  {
    question: "What does Little Bunnies sell?",
    answer:
      "Little Bunnies designs baby strollers and prams — including 360° rotating reversible-seat strollers, lightweight travel strollers and a twin stroller — along with diaper bags and utility bags for parents. Everything is sold directly on littlebunnies.co.in with delivery across India.",
  },
  {
    question: "What does shipping cost and how long does delivery take?",
    answer: SHIPPING_ANSWER,
  },
  {
    question: "How can I pay?",
    answer:
      "Checkout accepts credit and debit cards, UPI and net banking through a secure payment page, so your card details never touch our servers.",
  },
  {
    question: "Can I return or exchange a product?",
    answer: EXCHANGE_ANSWER,
  },
  {
    question: "What age are Little Bunnies strollers suitable for?",
    answer:
      "Our strollers are built for babies from newborn age, with reclining seats that grow with your child into the toddler years. Exact weight limits and recline angles vary by model, so check the specifications on each product page.",
  },
  {
    question: "Where can I buy Little Bunnies products?",
    answer:
      "Directly on littlebunnies.co.in, and selected stroller models are also available on Amazon.in.",
  },
];

export const PRAMS_FAQS: Faq[] = [
  {
    question: "How do I choose a baby stroller for a newborn?",
    answer:
      "Look for a seat that reclines almost flat, a parent-facing option so you can see your baby, a UV-rated canopy, a safety harness with working brakes, and a fold that fits your car boot. Little Bunnies' Comfy Rider, Cocoon, Urban Glider and Two Way Handle strollers combine reversible seats with a lightweight aluminium frame.",
  },
  {
    question: "Which Little Bunnies strollers have a 360° rotating seat?",
    answer:
      "The Comfy Rider, Comfy Rider Lite, Comfy Rider Pro and Cocoon strollers have a seat that rotates 360°, so you can switch between parent-facing and forward-facing with one hand without lifting your baby out.",
  },
  {
    question: "Which Little Bunnies strollers are lightweight?",
    answer:
      "The Eco Pro weighs just 5.3 kg, the Two Way Handle Reversible Stroller 6.57 kg, the Cocoon Plus 7.88 kg and the Comfy Rider range around 8 kg — all with aluminium frames that fold compactly. Exact weights are listed on each product page.",
  },
  {
    question: "Do you sell a twin or double stroller?",
    answer:
      "Yes. The Little Bunnies Twin Stroller has two independently reclining seats, a three-tier XL canopy, swivel wheels and a large storage basket — suitable for twins or two children close in age.",
  },
  {
    question: "Can I take a Little Bunnies stroller on a flight?",
    answer:
      "The Eco Pro and the Cabin Stroller are designed to fold compactly for air travel. Cabin baggage rules differ by airline, so always check the folded dimensions on the product page against your airline's limits.",
  },
  {
    question: "What does shipping cost and how long does delivery take?",
    answer: SHIPPING_ANSWER,
  },
  {
    question: "Can I return or exchange a stroller?",
    answer: EXCHANGE_ANSWER,
  },
];

export const BAGS_FAQS: Faq[] = [
  {
    question: "Are Little Bunnies diaper bags waterproof?",
    answer:
      "They're made from water-resistant fabric that protects what's inside from spills and light rain. Several styles also have a separate waterproof-lined wet & dry pocket for damp clothes and bibs — the details are listed on each product page.",
  },
  {
    question: "What can I fit in a Little Bunnies diaper bag?",
    answer:
      "Diapers, wipes, spare clothes, bottles, toys and your own essentials. Our bags have large main compartments, organiser pockets and insulated bottle pockets, and some add an anti-theft back pocket or wide doctor-style opening for easy access.",
  },
  {
    question: "Can a diaper bag attach to my stroller?",
    answer:
      "Yes. Many of our diaper bags come with stroller straps so you can hang the bag from the stroller handle and keep your hands free.",
  },
  {
    question: "Is there a diaper bag with a USB charging port?",
    answer:
      "Yes — the Little Bunnies Diaper Bag with USB Charging Port has an external USB port that connects to a power bank inside the bag, so you can charge your phone on the go.",
  },
  {
    question: "Which bag is best for hospital visits or travel?",
    answer:
      "The Little Bunnies Duffle Bag is built for it, with 15 storage pockets, a luggage sleeve, stroller straps, an insulated pacifier case and a removable divider. For everyday outings, the lighter Mini Utility Bag or a diaper backpack is easier to carry.",
  },
  {
    question: "What does shipping cost and how long does delivery take?",
    answer: SHIPPING_ANSWER,
  },
  {
    question: "Can I return or exchange a diaper bag?",
    answer: EXCHANGE_ANSWER,
  },
];

/**
 * Reuse an entry from one of the lists above by its exact question text, so
 * the /faq page shares answers with the other pages instead of copying them.
 * Throws at build time if a question is reworded, rather than silently
 * dropping it from the page.
 */
function pick(list: Faq[], question: string): Faq {
  const found = list.find((f) => f.question === question);
  if (!found) throw new Error(`seoContent: no FAQ with question "${question}"`);
  return found;
}

/**
 * The /faq help page. Policy answers mirror /shipping-policy, /exchange-policy
 * and /returns (orders can't be cancelled, no cash refunds, 15-day exchange,
 * credit notes valid 30 days, ₹200 reverse pickup).
 */
export const FAQ_PAGE_CATEGORIES: FaqCategory[] = [
  {
    id: "shipping",
    title: "Orders & Shipping",
    items: [
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery takes 7–15 business days across India, not counting Sundays and public holidays. Orders are processed in about 2 working days, and some locations may take longer. You're notified as soon as your order is dispatched.",
      },
      {
        question: "Is there free shipping?",
        answer: SHIPPING_COST_ANSWER,
      },
      {
        question: "Do you deliver all over India?",
        answer:
          "Yes, we ship all over India except some remote areas. We don't currently deliver outside India.",
      },
      {
        question: "How do I track my order?",
        answer:
          "You'll receive a confirmation when you order and a message or call once it's dispatched. Signed-in customers can also see their orders in their account, and you can message us on WhatsApp with your order number at any time.",
      },
      {
        question: "Can I change my delivery address after placing an order?",
        answer:
          "Message us on WhatsApp or through our contact page with your order number as soon as possible. Orders are sent to our production team quickly, so a change can't be guaranteed once an order is being processed or has been dispatched.",
      },
      {
        question: "What should I do if my package arrives opened or damaged?",
        answer:
          "Please don't accept a package that looks opened or tampered with, and contact us straight away — we can't consider reports made more than 24 hours after the attempted delivery. We also recommend recording an unboxing video whenever you open an order.",
      },
    ],
  },
  {
    id: "exchanges",
    title: "Exchanges & Credit Notes",
    items: [
      {
        question: "Can I return or exchange a product?",
        answer: EXCHANGE_ANSWER,
      },
      {
        question: "Can I cancel my order or get a refund?",
        answer:
          "Orders can't be cancelled once placed, because they're sent to our production team as soon as we receive them, and we don't issue cash refunds. We offer exchanges and credit notes instead — see the questions below.",
      },
      {
        question: "Which products are eligible for an exchange?",
        answer:
          "Orders can be exchanged within 15 days of delivery. Items must be unused and unwashed, with original tags and packaging intact, and a product can only be exchanged once. Flash-sale and clearance items aren't eligible.",
      },
      {
        question: "How do I request an exchange?",
        answer:
          "Open our Exchange Request page, enter your order number and the phone number or email used for the order, choose the item and describe the issue. An unboxing video is required, and you can add photos too.",
      },
      {
        question: "How do credit notes work?",
        answer:
          "We don't give cash refunds — we issue a credit note equal to the value of your original order instead. It can be used on any item on littlebunnies.co.in, is valid for 30 days from the date of issue and is applied at checkout. Credit notes are processed within 4–5 working days after the product reaches our warehouse and passes a quality check.",
      },
      {
        question: "Is there a charge for reverse pickup?",
        answer:
          "Yes. Reverse pickup carries a mandatory ₹200 logistics fee, paid by the customer to start the exchange, and the pickup can take up to 3–4 working days.",
      },
    ],
  },
  {
    id: "products",
    title: "Strollers & Diaper Bags",
    items: [
      pick(HOME_FAQS, "What does Little Bunnies sell?"),
      pick(HOME_FAQS, "Where can I buy Little Bunnies products?"),
      pick(PRAMS_FAQS, "How do I choose a baby stroller for a newborn?"),
      pick(HOME_FAQS, "What age are Little Bunnies strollers suitable for?"),
      pick(PRAMS_FAQS, "Which Little Bunnies strollers have a 360° rotating seat?"),
      pick(PRAMS_FAQS, "Which Little Bunnies strollers are lightweight?"),
      {
        question: "Are Little Bunnies strollers safe for newborns?",
        answer:
          "Our strollers are designed for use from newborn age. Recline range, harness and brake details vary by model and are listed on each product page. As with any baby product, follow the instructions supplied with your stroller, always use the harness, and never leave your baby unattended.",
      },
      pick(BAGS_FAQS, "Are Little Bunnies diaper bags waterproof?"),
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      pick(HOME_FAQS, "How can I pay?"),
      {
        question: "Is my payment information secure?",
        answer:
          "Payments are completed on a secure payment page and the site is served over HTTPS. We don't store your card details.",
      },
      {
        question: "Can I use more than one discount code?",
        answer: "No — only one discount code can be applied per order at checkout.",
      },
      {
        question: "My payment failed but money was deducted — what should I do?",
        answer:
          "Failed payments are normally reversed to your account automatically by your bank or the payment gateway. If you don't see the amount back within a few working days, message us on WhatsApp with your order number and payment reference and we'll look into it.",
      },
    ],
  },
];
