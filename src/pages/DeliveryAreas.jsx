import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Truck } from "lucide-react";

const SUBURBS = [
  "Marrickville", "Enmore", "Newtown", "Stanmore", "Petersham", "Lewisham",
  "Dulwich Hill", "Summer Hill", "Leichhardt", "Annandale", "Erskineville",
  "Alexandria", "St Peters", "Sydenham", "Tempe", "Camperdown", "Ashfield",
];

export default function DeliveryAreas() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Delivery Areas</h1>
      <p className="text-lg text-gray-600 mb-10">
        We prepare every meal fresh from our kitchen at 377 Enmore Road, Marrickville, and deliver
        across the Inner West. Pickup from our Marrickville kitchen is also available for every plan.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="p-6 bg-green-50 rounded-xl border border-green-100">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Delivery</h2>
          <p className="text-gray-600">
            We currently deliver to the suburbs listed below. Enter your address at checkout to
            confirm we cover your area and see delivery day options.
          </p>
        </div>
        <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pickup</h2>
          <p className="text-gray-600">
            Prefer to collect your meals yourself? Pickup is available from our kitchen at 377 Enmore
            Road, Marrickville NSW 2204, on your scheduled delivery day.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Suburbs we currently serve</h2>
      <div className="flex flex-wrap gap-2 mb-10">
        {SUBURBS.map((suburb) => (
          <span
            key={suburb}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm"
          >
            {suburb}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-10">
        Don't see your suburb? We're expanding our delivery zone regularly —{" "}
        <Link to={createPageUrl("Contact")} className="text-green-600 hover:underline">
          get in touch
        </Link>{" "}
        and we'll let you know when we reach you.
      </p>

      <div className="flex flex-wrap gap-4">
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
  );
}
