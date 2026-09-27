import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: 27 September 2026</p>

      <div className="prose prose-lg text-gray-700 space-y-6 max-w-none">
        <p>
          Arancini Meals ("we", "us", "our") respects your privacy and is committed to protecting
          the personal information you share with us. This policy explains what we collect, how we
          use it, and the choices and rights you have. It's written to comply with the Australian
          Privacy Principles under the Privacy Act 1988 (Cth).
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Who we are</h2>
        <p>
          Arancini Meals is a meal-prep subscription and delivery service operating from 377 Enmore
          Road, Marrickville NSW 2204, Australia. You can contact us at{" "}
          <a href="mailto:office@arancinimeals.com" className="text-green-600 hover:underline">
            office@arancinimeals.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Account details:</strong> name, email address, phone number.</li>
          <li><strong>Delivery information:</strong> delivery or pickup address and delivery instructions.</li>
          <li><strong>Order and subscription details:</strong> meal selections, dietary preferences, allergen notes, and subscription plan and schedule.</li>
          <li><strong>Payment information:</strong> payments are processed by Stripe; we do not store your full card number on our servers.</li>
          <li><strong>Communications:</strong> messages you send us through the Contact form, email, or chat assistant.</li>
          <li><strong>Usage data:</strong> pages visited and basic device/browser information, collected via cookies and similar technologies.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How we use your information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To create and manage your account and subscription.</li>
          <li>To prepare, fulfil, and deliver your orders.</li>
          <li>To process payments and manage billing.</li>
          <li>To respond to enquiries and provide customer support.</li>
          <li>To send order and account updates, and — with your consent — marketing communications.</li>
          <li>To personalise meal recommendations and improve our menu and service.</li>
          <li>To meet our legal and regulatory obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Who we share it with</h2>
        <p>We don't sell your personal information. We share it only with service providers who help us run Arancini Meals:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>HubSpot</strong> — customer relationship management and, where you've opted in, marketing emails.</li>
          <li><strong>Base44</strong> — the platform that hosts and runs our app.</li>
          <li><strong>Delivery personnel/couriers</strong> — to get your order to you.</li>
        </ul>
        <p>Some of these providers may store data on servers located outside Australia.</p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies</h2>
        <p>
          We use cookies and similar technologies to keep you signed in, remember your cart, and
          understand how the app is used so we can improve it. You can control cookies through your
          browser settings.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data security</h2>
        <p>
          We take reasonable technical and organisational steps to protect your personal information
          against loss, misuse, and unauthorised access. No method of transmission or storage is
          completely secure, but we work with reputable providers (like Stripe for payments) to keep
          your data safe.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. How long we keep your information</h2>
        <p>
          We keep personal information for as long as needed to provide our service and meet legal,
          accounting, or reporting requirements, after which it is securely deleted or de-identified.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Your rights</h2>
        <p>
          You can ask us to access, correct, or delete the personal information we hold about you at
          any time by emailing{" "}
          <a href="mailto:office@arancinimeals.com" className="text-green-600 hover:underline">
            office@arancinimeals.com
          </a>. If you're not satisfied with how we've handled your information, you can lodge a
          complaint with the Office of the Australian Information Commissioner (OAIC) at{" "}
          <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
            oaic.gov.au
          </a>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Children's privacy</h2>
        <p>
          Our service is not directed at children, and we do not knowingly collect personal
          information from anyone under 15 without parental consent.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. We'll post the updated version here with a new
          "last updated" date.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contact us</h2>
        <p>
          Arancini Meals, 377 Enmore Road, Marrickville NSW 2204, Australia<br />
          Email:{" "}
          <a href="mailto:office@arancinimeals.com" className="text-green-600 hover:underline">
            office@arancinimeals.com
          </a>
        </p>

        <div className="mt-10">
          <Link
            to={createPageUrl("Contact")}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
