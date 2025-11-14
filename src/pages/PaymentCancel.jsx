import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-12 text-center">
              {/* Cancel Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>

              {/* Cancel Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Payment Cancelled
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <div className="text-blue-700 mb-3 font-semibold">
                  Your cart is still saved
                </div>
                <p className="text-sm text-gray-600">
                  Don't worry! All your selected items are still in your cart. 
                  You can review your order and try again whenever you're ready.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={() => navigate(createPageUrl('Cart'))}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Return to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
                  onClick={() => navigate(createPageUrl('Meals'))}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
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

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Having trouble with payment?
          </p>
          <p className="text-sm text-gray-500">
            Contact us at <a href="mailto:support@arancinimeals.com" className="text-green-600 hover:underline">support@arancinimeals.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}