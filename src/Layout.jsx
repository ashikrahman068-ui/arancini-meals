import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  User,
  Receipt,
  Menu,
  X,
  Facebook,
  Instagram,
  Music,
  Truck,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import ChatTrigger from "./components/agents/ChatTrigger";
import ChatWidget from "./components/agents/ChatWidget";
import { CartProvider, useCart } from "./components/cart/CartContext";
import BottomNav from "./components/navigation/BottomNav";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [userRole, setUserRole] = React.useState(null);
  const { getTotalItems } = useCart();

  React.useEffect(() => {
    checkAuthentication();
  }, [location.pathname]);

  React.useEffect(() => {
    // Sync new user to HubSpot after authentication
    const syncNewUser = async () => {
      if (isAuthenticated) {
        try {
          const user = await base44.auth.me();
          
          // Check if user was created recently (within last 5 minutes = new signup)
          const createdDate = new Date(user.created_date);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const isNewUser = createdDate > fiveMinutesAgo;
          
          // Also check sessionStorage flag for explicit new signup
          const explicitNewSignup = sessionStorage.getItem('new_signup') === 'true';
          
          if (isNewUser || explicitNewSignup) {
            sessionStorage.removeItem('new_signup');
            
            await base44.functions.invoke('hubspotSyncContact', {
              email: user.email,
              full_name: user.full_name
            });
            
            console.log('New user synced to HubSpot:', user.email);
          }
        } catch (error) {
          console.error('Failed to sync to HubSpot:', error);
        }
      }
    };
    syncNewUser();
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const user = await base44.auth.me();
        setUserRole(user.role);
      } else {
        setUserRole(null); // Clear role if not authenticated
      }
      
      // Home is viewable without authentication — no redirect to Welcome
    } catch (error) {
      console.error("Authentication check failed:", error); // Log the error for debugging
      setIsAuthenticated(false);
      setUserRole(null); // Clear role on error
      // Home is viewable without authentication — no redirect on error
    } finally {
      setCheckingAuth(false);
    }
  };

  const navigationItems = [
    { name: "Home", url: createPageUrl("Home"), icon: Home },
    { name: "Meals", url: createPageUrl("Meals"), icon: UtensilsCrossed },
    { name: "Subscriptions", url: createPageUrl("Subscriptions"), icon: Calendar },
    { name: "Meal Planner", url: createPageUrl("MealPlanner"), icon: Calendar },
    { name: "Blog", url: createPageUrl("Blog"), icon: Receipt }, // Added Blog item
    { name: "Deliveries", url: createPageUrl("Deliveries"), icon: Truck },
    { name: "Cart", url: createPageUrl("Cart"), icon: ShoppingCart },
    { name: "Account", url: createPageUrl("Account"), icon: User },
    { name: "Orders", url: createPageUrl("Orders"), icon: Receipt }
  ];

  // Add Manage Blog for admins
  if (userRole === 'admin') {
    navigationItems.push({
      name: "Manage Blog",
      url: createPageUrl("ManageBlog"),
      icon: Receipt
    });
    navigationItems.push({
      name: "Admin Data",
      url: createPageUrl("AdminData"),
      icon: Receipt
    });
    navigationItems.push({
      name: "Meal Popularity",
      url: createPageUrl("MealPopularity"),
      icon: Receipt
    });
  }

  const isActiveRoute = (url) => location.pathname === url;

  // Don't show layout for Welcome page
  if (currentPageName === 'Welcome') {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isRootPage = location.pathname === createPageUrl('Home') || location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-16 lg:pb-0">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-green-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 min-h-[44px]">
            {/* Back Button (Mobile) + Logo */}
            <div className="flex items-center gap-2">
              {!isRootPage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="lg:hidden min-h-[44px] min-w-[44px]"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Link to={createPageUrl("Home")} className="flex items-center space-x-3 group">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/74c11fd48_IMG_5236.png" alt="Arancini Meals Logo" className="h-24" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.url)
                      ? 'bg-green-100 text-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                  {item.name === 'Cart' && (
                    <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden min-h-[44px] min-w-[44px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-green-100">
            <div className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.url)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.name === 'Cart' && (
                    <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
      <Toaster richColors />

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Chat Widget */}
      <ChatTrigger isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/74c11fd48_IMG_5236.png"
                  alt="Arancini Meals Logo"
                  className="h-16"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Delivering fresh, healthy, and delicious meal prep directly to your door.
                Nutrition-focused, chef-prepared meals for your busy lifestyle.
              </p>

              {/* Social Links */}
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-white mb-3 text-sm">Follow Us</h4>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/arancini_meals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                      <Facebook className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-gray-400">Facebook</div>
                  </a>

                  <a
                    href="https://www.instagram.com/arancini_meals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-gray-400">Instagram</div>
                  </a>

                  <a
                    href="https://www.tiktok.com/@arancini_meals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-gray-400">TikTok</div>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("About")} className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to={`${createPageUrl("Home")}#how-it-works`} className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to={createPageUrl("DeliveryAreas")} className="hover:text-white transition-colors">Delivery Areas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li><Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to={createPageUrl("Help")} className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to={createPageUrl("TermsOfService")} className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>

              {/* Shop Location Map */}
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-white mb-3 text-sm">Pickup Location</h4>
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-2">
                  <iframe
                    src="https://www.google.com/maps?q=377+Enmore+Road,+Marrickville+NSW+2204,+Australia&output=embed"
                    width="100%"
                    height="100"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shop Location"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  377 Enmore Road<br />
                  Marrickville, NSW 2204
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            © 2025 Arancini Meals. All rights reserved. Made with ❤️ for healthy living.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <CartProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </CartProvider>
  );
}