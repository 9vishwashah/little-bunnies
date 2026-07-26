import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Little Bunnies' Privacy Policy — learn how we collect, use, and protect your information.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <ShieldCheck size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Privacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-ink mb-4">
            Privacy Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Learn how we collect, use, and protect your information to improve your shopping experience.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="policy-prose">
            <p>
              We collect various types of information to improve your shopping experience and process your orders. This includes:
            </p>
            
            <h3>Personal Information</h3>
            <p>
              Personally Identifiable Information is information that identifies a specific End User. When you engage in certain activities on the Website, such as creating an account, ordering a product or service from us, posting a review, requesting information about our services, (collectively, "Identification Activities") we may collect personal information such as:
            </p>
            <ul>
              <li>Name</li>
              <li>Address</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Payment Information (credit card details, billing address, etc.)</li>
            </ul>

            <h3>Non-Personal Information</h3>
            <p>
              Non-Personally Identifiable Information is information that does not identify a specific End User. This type of information may include things like the Uniform Resource Locator ("URL") of the website you visited before coming to our Website, the URL of the website you visit after leaving our Website, the type of browser you are using and your Internet Protocol ("IP") address.
            </p>
            <p>
              We use Non-Personally Identifiable Information to troubleshoot, administer the Website, analyze trends, gather demographic information, comply with applicable law, and cooperate with law enforcement activities.
            </p>

            <h3>How We Use Your Information</h3>
            <p>We use the information we collect for various purposes, including:</p>
            <ul>
              <li><strong>Order Processing:</strong> To process and fulfill your orders, including payment and shipping.</li>
              <li><strong>Customer Service:</strong> To provide support and respond to inquiries.</li>
              <li><strong>Improvement of Services:</strong> To analyze trends, monitor site performance, and improve your user experience.</li>
            </ul>

            <h3>Sharing Your Information</h3>
            <p>
              We do not sell or rent your personal information to third parties. However, we may share your information in the following situations:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> We may share your data with third-party service providers who assist in operating our website, processing payments, shipping products, or sending marketing communications.</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to a legal request (e.g., court order or government investigation), we may disclose your information to authorities.</li>
            </ul>

            <h3>Data Security</h3>
            <p>
              We take reasonable steps to protect your personal information using encryption, secure servers, and other security measures. However, no method of data transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
            </p>

            <h3>Data Retention</h3>
            <p>
              We retain your personal information only as long as necessary for the purposes outlined in this Privacy Policy or as required by law. Once your data is no longer needed, we will securely delete or anonymize it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
