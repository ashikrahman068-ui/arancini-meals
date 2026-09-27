import React, { useState } from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "office@arancinimeals.com",
      subject: `Contact Form: ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    });
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-10">
        We'd love to hear from you! Whether you have a question about your order, want to explore a
        custom meal plan, or just want to say hello — reach out and we'll get back to you promptly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <Input
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <Textarea
              placeholder="How can we help you?"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>

        {/* Contact Details */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <a
                href="mailto:office@arancinimeals.com"
                className="text-green-600 hover:underline"
              >
                office@arancinimeals.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pickup Location</p>
              <p className="text-gray-600">377 Enmore Road<br />Marrickville, NSW 2204</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Social Media</p>
              <div className="flex gap-3 mt-2">
                <a href="https://www.facebook.com/arancini_meals" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="https://www.instagram.com/arancini_meals" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="https://www.tiktok.com/@arancini_meals" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-black rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Music className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}