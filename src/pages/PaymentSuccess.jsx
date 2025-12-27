import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Package, Receipt, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session_id');
    setSessionId(sid);
    
    if (sid) {
      verifyPayment(sid);
    } else {
      setProcessing(false);
    }
  }, []);

  const verifyPayment = async (sessionId) => {
    try {
      // Call backend to verify and activate subscription if needed
      await base44.functions.invoke('verifyStripeSession', { sessionId });
      setProcessing(false);
    } catch (error) {
      console.error('Payment verification error:', error);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-12 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              {/* Success Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Payment Successful! 🎉
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your order! We've received your payment and are preparing your delicious meals.
              </p>

              {/* Order Details */}
              <div className="bg-green-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 text-green-700 mb-3">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">What's Next?</span>
                </div>
                <ul className="text-left space-y-2 text-sm text-gray-600 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    You'll receive a confirmation email shortly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    Our chefs will prepare your meals with fresh ingredients
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    Track your delivery in real-time on the Deliveries page
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">4.</span>
                    Enjoy your nutritious, chef-prepared meals!
                  </li>
                </ul>
              </div>

              {/* Transaction ID */}
              {sessionId && (
                <div className="text-xs text-gray-400 mb-8">
                  Transaction ID: {sessionId}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={() => navigate(createPageUrl('Orders'))}
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  View My Orders
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8"
                  onClick={() => navigate(createPageUrl('Deliveries'))}
                >
                  Track Delivery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Back to Home */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to Home
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact us at <a href="mailto:support@arancinimeals.com" className="text-green-600 hover:underline">support@arancinimeals.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}