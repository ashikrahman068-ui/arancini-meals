import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, UtensilsCrossed, Calendar, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../cart/CartContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const { getTotalItems } = useCart();

  const navItems = [
    { name: 'Home', url: createPageUrl('Home'), icon: Home },
    { name: 'Meals', url: createPageUrl('Meals'), icon: UtensilsCrossed },
    { name: 'Planner', url: createPageUrl('MealPlanner'), icon: Calendar },
    { name: 'Cart', url: createPageUrl('Cart'), icon: ShoppingCart, badge: getTotalItems() },
    { name: 'Account', url: createPageUrl('Account'), icon: User },
  ];

  const isActive = (url) => location.pathname === url;

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          
          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative transition-colors min-h-[44px]",
                active ? "text-green-600" : "text-gray-500 hover:text-green-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", active && "scale-110")} />
                {item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                active && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}