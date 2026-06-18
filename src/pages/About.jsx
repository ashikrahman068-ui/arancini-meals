import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Arancini Meals</h1>

      <div className="prose prose-lg text-gray-700 space-y-6">
        <p>
          Arancini Meals is a Sydney-based meal prep and delivery service dedicated to making healthy,
          chef-prepared food accessible to everyone. We believe that eating well should never feel
          like a chore — which is why we do the planning, shopping, cooking, and delivering, so you
          can focus on living your best life.
        </p>

        <p>
          Our menu features a rotating selection of nutritionist-approved meals spanning a wide range
          of cuisines — from hearty Italian-inspired dishes to vibrant Asian bowls and protein-packed
          Mediterranean plates. Every meal is crafted from fresh, locally sourced ingredients and
          prepared in our commercial kitchen without compromising on flavour or nutritional value.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Who Is Arancini Meals For?</h2>
        <p>
          We serve busy professionals, fitness enthusiasts, families, and anyone who wants to eat
          better without spending hours in the kitchen. Whether you're on a weight-loss journey,
          building muscle, or simply want reliable, delicious meals delivered to your door each
          week, Arancini Meals has a plan that fits your lifestyle and dietary needs.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Subscription Plans</h2>
        <p>
          We offer flexible weekly, bi-weekly, and monthly subscription plans so you can choose
          the delivery frequency that works for you. Subscribers enjoy priority scheduling, the
          ability to customise their meal selections each week, and exclusive access to new menu
          items before they're available to the general public.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Story</h2>
        <p>
          Arancini Meals was founded in Sydney with a simple mission: bring restaurant-quality
          meal prep to everyday Australians. Our team of passionate chefs and nutritionists work
          together every week to design menus that are as satisfying as they are nourishing. From
          our kitchen in Marrickville to your doorstep, every meal is packed with care.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to={createPageUrl("Meals")}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Browse Our Meals
          </Link>
          <Link
            to={createPageUrl("Subscriptions")}
            className="inline-block border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            View Subscription Plans
          </Link>
        </div>
      </div>
    </div>
  );
}