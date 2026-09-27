
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Clock,
  Truck,
  Shield,
  Star,
  ArrowRight,
  Zap,
  Target,
  Heart,
  Gift
} from
"lucide-react";
// TikTokFeed component is not rendered here yet — re-add once @arancini_meals has
// real posted videos to embed (swap in their actual video IDs in TikTokFeed.jsx first).
// import TikTokFeed from "../components/social/TikTokFeed";

export default function Home() {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = React.useState('');

  React.useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('referral_code', refCode);
    }
  }, []);

  const features = [
  {
    icon: ChefHat,
    title: "Chef-Prepared Meals",
    description: "Every meal is crafted by professional chefs with fresh, high-quality ingredients"
  },
  {
    icon: Target,
    title: "Nutrition Focused",
    description: "Detailed nutritional information and meals designed for your specific health goals"
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "No more meal planning, shopping, or cooking. More time for what matters most"
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "Insulated packaging keeps meals fresh during delivery to your doorstep"
  }];


  const valueProps = [
  {
    text: "Every meal is chef-prepared from fresh ingredients and comes with full nutritional info, so you always know what you're eating."
  },
  {
    text: "Built for busy schedules — pick your meals, we handle the planning, prepping, and cooking, delivered fresh to your door."
  },
  {
    text: "Flexible plans built around your goals, with the ability to pause, swap meals, or cancel any time before the weekly cutoff."
  }];


  return (
    <div className="min-h-screen">
      {/* Referral Banner */}
      {referralCode && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <Gift className="w-4 h-4" />
            <span>
              You've been referred! Use code <strong>{referralCode}</strong> to get $10 off your first subscription!
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-mint-50 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  <Zap className="w-3 h-3 mr-1" />
                  New: AI-Powered Meal Planning
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Healthy eating made 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500 block">
                    effortless
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Chef-prepared, nutrition-focused meals delivered fresh to your door. 
                  Customized meal plans based on your goals, dietary needs, and preferences.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Meals")}>
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Browse Meals
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("MealPlanner")}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-semibold">
                    Create Meal Plan
                  </Button>
                </Link>
              </div>

            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Healthy meal prep containers"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl" />

              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-green-400 to-mint-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Arancini Meals?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another meal delivery service. We're your partner in healthy living.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) =>
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-green-50 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to transform your eating habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
            {
              step: "01",
              title: "Choose Your Plan",
              description: "Browse our menu or let our AI create a personalized meal plan based on your goals and preferences.",
              icon: Target
            },
            {
              step: "02",
              title: "We Prep & Pack",
              description: "Our chefs prepare your meals with fresh ingredients and pack them in eco-friendly, temperature-controlled containers.",
              icon: ChefHat
            },
            {
              step: "03",
              title: "Enjoy & Repeat",
              description: "Fresh meals delivered to your door. Heat, eat, and enjoy nutritious food without the hassle.",
              icon: Heart
            }].
            map((step, index) =>
            <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                    <step.icon className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why People Choose Arancini Meals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((item, index) =>
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((i) =>
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* TikTok Feed Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get daily meal inspiration, cooking tips, and behind-the-scenes content from our kitchen
            </p>
          </div>
          
          <div className="text-center">
            <a
              href="https://www.tiktok.com/@arancini_meals"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-lg"
            >
              Follow us on TikTok
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Healthy Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Chef-prepared meals, delivered fresh — pick your plan and get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Meals")}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-green-700 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold shadow-lg">
                Start Ordering Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("MealPlanner")}>
              <Button variant="outline" size="lg" className="bg-slate-900 text-white px-8 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-11 w-full sm:w-auto border-white hover:bg-white/10 rounded-xl">
                Try Meal Planner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);

}
