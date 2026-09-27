import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do subscriptions work?",
    a: "Choose a weekly, bi-weekly, or monthly plan, pick your meals for the week (or let our meal planner suggest a set based on your goals), and we prepare and deliver them fresh. You can change your meal selection each cycle before the weekly cutoff."
  },
  {
    q: "What's the weekly cutoff?",
    a: "Orders and any changes — swapping meals, pausing, or cancelling — need to be made by Saturday 11:59pm (Sydney time) for that week's delivery. Anything after that applies to the following week."
  },
  {
    q: "Can I pause instead of cancelling?",
    a: "Yes. Pausing from the Manage Subscription page stops billing and deliveries without losing your subscription or discount, and you can resume whenever you're ready. Cancelling ends the subscription altogether."
  },
  {
    q: "Do you cater for allergies or dietary needs?",
    a: "Every meal lists its ingredients and dietary tags (gluten-free, dairy-free, vegan, high-protein, and more). Our kitchen does handle common allergens, so please check each meal's ingredients and reach out if you have a specific concern."
  },
  {
    q: "Where do you deliver, and can I pick up instead?",
    a: "We deliver across the Inner West from our Marrickville kitchen, and pickup from 377 Enmore Road is available on every plan. See our Delivery Areas page for the full suburb list."
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept card payments via Stripe. Additional payment methods will be announced here once available."
  },
  {
    q: "How do referrals work?",
    a: "Share your referral link or code with a friend — when they subscribe, you'll both get a discount. Check the Account page for your personal referral code."
  },
  {
    q: "How do I get in touch if I need help?",
    a: "Use the chat icon in the corner of the app, or head to our Contact page — we usually reply within one business day."
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
      <p className="text-lg text-gray-600 mb-10">
        Answers to the questions we hear most. Can't find what you need?{" "}
        <Link to={createPageUrl("Contact")} className="text-green-600 hover:underline">
          Contact us
        </Link>{" "}
        directly.
      </p>

      <div>
        {FAQS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>

      <div className="mt-10">
        <Link
          to={createPageUrl("Contact")}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
