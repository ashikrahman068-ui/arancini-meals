import React, { useState, useEffect, useMemo } from "react";
import { Meal } from "@/entities/Meal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Grid3X3, 
  List, 
  TrendingUp,
  ShoppingCart,
  UtensilsCrossed
} from "lucide-react";
import { useCart } from "../components/cart/CartContext";

import MealCard from "../components/meals/MealCard";
import MealFilters from "../components/meals/MealFilters";
import MealDetailsModal from "../components/meals/MealDetailsModal";

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState('all');
  const [priceRange, setPriceRange] = useState(50);
  const [sortBy, setSortBy] = useState('popularity');

  const { addToCart, getTotalItems } = useCart();

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    setIsLoading(true);
    try {
      const fetchedMeals = await Meal.list();
      setMeals(fetchedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
    setIsLoading(false);
  };

  // Filter and sort meals
  const filteredAndSortedMeals = useMemo(() => {
    let filtered = meals.filter(meal => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          meal.name?.toLowerCase().includes(searchLower) ||
          meal.description?.toLowerCase().includes(searchLower) ||
          meal.cuisine_type?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && meal.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (selectedDietary !== 'all') {
        if (!meal.dietary_tags || !meal.dietary_tags.includes(selectedDietary)) {
          return false;
        }
      }

      // Price filter
      if (meal.price > priceRange) {
        return false;
      }

      return meal.is_available !== false;
    });

    // Sort meals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'calories_low':
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        case 'protein_high':
          return (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0);
        case 'newest':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'popularity':
        default:
          return (b.popularity_score || 0) - (a.popularity_score || 0);
      }
    });

    return filtered;
  }, [meals, searchTerm, selectedCategory, selectedDietary, priceRange, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedDietary !== 'all') count++;
    if (priceRange < 50) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedCategory, selectedDietary, priceRange, searchTerm]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDietary('all');
    setPriceRange(50);
    setSortBy('popularity');
  };

  const handleAddToCart = (meal) => {
    addToCart(meal);
    
    // Close modal if it's open
    if (showMealDetails) {
      setShowMealDetails(false);
      setSelectedMeal(null);
    }
  };

  const handleViewDetails = (meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const handleCloseMealDetails = () => {
    setShowMealDetails(false);
    setSelectedMeal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Our Meals
              </h1>
              <p className="text-lg text-gray-600">
                Chef-prepared, nutrition-focused meals delivered fresh to your door
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>{filteredAndSortedMeals.length} meals available</span>
              </div>
              
              <div className="flex border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {getTotalItems() > 0 && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({getTotalItems()})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MealFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDietary={selectedDietary}
            setSelectedDietary={setSelectedDietary}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            activeFilters={activeFiltersCount}
            clearFilters={clearAllFilters}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchTerm ? `Results for "${searchTerm}"` : 'All Meals'}
              <Badge variant="secondary" className="ml-2">
                {filteredAndSortedMeals.length}
              </Badge>
            </h2>
          </div>
        </div>

        {/* Meals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedMeals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No meals found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to see more results.
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }>
            {filteredAndSortedMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Meal Details Modal */}
      <MealDetailsModal
        meal={selectedMeal}
        isOpen={showMealDetails}
        onClose={handleCloseMealDetails}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}