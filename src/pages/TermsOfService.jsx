import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: 27 September 2026</p>

      <div className="prose prose-lg text-gray-700 space-y-6 max-w-none">
        <p>
          These Terms of Service ("Terms") govern your use of the Arancini Meals website and app and
          your purchase of meals or subscriptions from us. By placing an order or creating an account,
          you agree to these Terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. About the service</h2>
        <p>
          Arancini Meals is a chef-prepared meal subscription and delivery service based at 377 Enmore
          Road, Marrickville NSW 2204. We offer one-off meal orders and weekly, bi-weekly, and monthly
          subscription plans, with delivery and pickup available in our service area. Our AI meal
          planner suggests meals based on the goals and preferences you provide — it's a convenience
          tool, not medical, dietary, or nutritional advice.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Your account</h2>
        <p>
          You must provide accurate, current information when creating an account and keep your login
          details secure. You must be at least 18 years old to place an order or hold a subscription
          with us.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Orders and the weekly cutoff</h2>
        <p>
          Orders and changes to your upcoming delivery (meal swaps, pausing, or cancelling) must be
          made by <strong>Saturday 11:59pm (Sydney time)</strong> for that week's delivery. Changes made
          after the cutoff will apply to the following week's order instead.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Subscriptions and billing</h2>
        <p>
          Subscriptions renew and are billed automatically on your chosen schedule (weekly, bi-weekly,
          or monthly) via our payment processor, Stripe, until you pause or cancel. We'll give you
          reasonable notice of any price change before it takes effect. If a payment fails, we may
          pause your subscription until payment is resolved.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Pausing and cancelling</h2>
        <p>
          You can pause or cancel your subscription any time from the Manage Subscription page, or by
          emailing us, before the weekly cutoff above. Pausing stops billing and deliveries without
          losing your account or subscription discount; you can resume whenever you're ready.
          Cancelling ends your subscription — you're welcome to resubscribe later, though any
          subscriber-only discount would need to be reapplied. We don't provide refunds for meals that
          have already been prepared or dispatched.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Delivery and pickup</h2>
        <p>
          We deliver, or offer pickup from our Marrickville kitchen, within the areas listed on our{" "}
          <Link to={createPageUrl("DeliveryAreas")} className="text-green-600 hover:underline">
            Delivery Areas
          </Link>{" "}
          page. Delivery windows are estimates rather than guarantees. Risk in the meals passes to you
          once they're delivered to the address you provided or collected by you or someone on your
          behalf.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Food safety and allergens</h2>
        <p>
          Our meals are prepared in a commercial kitchen that also handles common allergens (including
          gluten, dairy, egg, soy, tree nuts, and seafood). Nutritional information is provided as a
          guide. If you have a food allergy, intolerance, or medical dietary requirement, please check
          each meal's ingredients and dietary tags, and consult a health professional if you're
          unsure — the meal planner's suggestions are not a substitute for medical advice.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Pricing and payment</h2>
        <p>
          Prices are shown in Australian dollars (AUD) and include GST where applicable. Payments are
          processed securely by Stripe; we do not store your full card details. Additional payment
          methods (such as PayPal) may be added in future and will be clearly marked when available.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Referral and promotional codes</h2>
        <p>
          Referral credits and promotional codes are subject to change or withdrawal at our discretion
          and, unless stated otherwise, are limited to one use per customer.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Acceptable use</h2>
        <p>
          You agree not to misuse our website or ordering system — including attempting to interfere
          with its operation, placing fraudulent orders, or abusing referral or promotional offers.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Intellectual property</h2>
        <p>
          All content on this site — including recipes, photography, text, and the Arancini Meals
          name and logo — belongs to Arancini Meals and may not be used without our permission.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Liability</h2>
        <p>
          To the extent permitted by law, Arancini Meals is not liable for indirect or consequential
          loss arising from your use of our service. Nothing in these Terms excludes, restricts, or
          modifies any consumer guarantee, right, or remedy you have under the Australian Consumer
          Law that cannot lawfully be excluded.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Governing law</h2>
        <p>These Terms are governed by the laws of New South Wales, Australia.</p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continuing to use Arancini Meals after an
          update means you accept the revised Terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact us</h2>
        <p>
          Arancini Meals, 377 Enmore Road, Marrickville NSW 2204, Australia<br />
          Email:{" "}
          <a href="mailto:office@arancinimeals.com" className="text-green-600 hover:underline">
            office@arancinimeals.com
          </a>
        </p>

        <div className="mt-10">
          <Link
            to={createPageUrl("PrivacyPolicy")}
            className="inline-block border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
