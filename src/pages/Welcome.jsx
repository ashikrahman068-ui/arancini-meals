import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserPlus, 
  Eye, 
  ChefHat, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Home as HomeIcon
} from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  const handleVisitAsGuest = () => {
    navigate(createPageUrl('Home'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Home'));
  };

  const handleGoToHome = () => {
    navigate(createPageUrl('Home'));
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-mint-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-mint-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/74c11fd48_IMG_5236.png" 
              alt="Arancini Meals Logo" 
              className="h-32"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isAuthenticated ? 'Welcome Back!' : 'Welcome to Arancini Meals'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chef-prepared, nutrition-focused meals delivered fresh to your door
          </p>
        </div>

        {/* Options Cards */}
        <div className={`grid ${isAuthenticated ? 'md:grid-cols-1 max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-8 max-w-4xl mx-auto`}>
          {isAuthenticated ? (
            // Authenticated user - single card to continue
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200 hover:border-green-500 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <HomeIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Continue to Your Dashboard
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Access your meals, orders, subscriptions, and personalized meal plans
                    </p>
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">Browse and order meals</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">Manage your subscriptions</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">Track deliveries in real-time</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">Use AI-powered meal planner</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg shadow-lg"
                    onClick={handleGoToHome}
                  >
                    Go to Home
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Not authenticated - show both options
            <>
              {/* Visit as Guest */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200 hover:border-green-500">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Eye className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Visit as Guest
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Browse our meals and explore our services without creating an account
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Browse our full menu</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">View meal details & nutrition</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Learn about our services</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">Place orders (requires account)</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-6 text-lg"
                      onClick={handleVisitAsGuest}
                    >
                      Continue as Guest
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Login or Sign Up */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200 hover:border-green-500 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Log In or Sign Up
                        </h2>
                        <Sparkles className="w-6 h-6 text-orange-500" />
                      </div>
                      <p className="text-gray-600 mb-6">
                        Create an account to order meals and unlock exclusive features
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Place orders & subscriptions</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">AI-powered meal planner</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Track deliveries in real-time</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Earn referral rewards</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Save favorite meals</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg shadow-lg"
                      onClick={handleLogin}
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-xs text-gray-500">
                      Free to sign up • No credit card required
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-full shadow-md">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Chef-Prepared</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">100+ Happy Customers</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">Nutrition-Focused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}