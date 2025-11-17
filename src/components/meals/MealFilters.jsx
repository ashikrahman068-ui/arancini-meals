
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  X,
  UtensilsCrossed
} from "lucide-react";

export default function MealFilters({ 
  searchTerm, 
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDietary,
  setSelectedDietary,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  activeFilters,
  clearFilters
}) {
  const categories = [
    { value: 'all', label: 'All Meals' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snacks' }
  ];

  const dietaryOptions = [
    { value: 'all', label: 'All Dietary' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-carb', label: 'Low Carb' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating_high', label: 'Highest Rated' }, // Added
    { value: 'rating_low', label: 'Lowest Rated' },   // Added
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'calories_low', label: 'Lowest Calories' },
    { value: 'protein_high', label: 'Highest Protein' },
    { value: 'newest', label: 'Newest First' }
  ];

  const hasActiveFilters = activeFilters > 0;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        {categories.slice(1).map(category => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(selectedCategory === category.value ? 'all' : category.value)}
            className={`rounded-full ${
              selectedCategory === category.value 
                ? 'bg-green-600 text-white' 
                : 'border-gray-200 text-gray-600 hover:bg-green-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Dietary</label>
          <Select value={selectedDietary} onValueChange={setSelectedDietary}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dietaryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Max Price</label>
          <Select value={priceRange.toString()} onValueChange={(value) => setPriceRange(Number(value))}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">Under $50</SelectItem>
              <SelectItem value="30">Under $30</SelectItem>
              <SelectItem value="20">Under $20</SelectItem>
              <SelectItem value="15">Under $15</SelectItem>
              <SelectItem value="10">Under $10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
          {!hasActiveFilters && (
            <div className="w-full flex items-center justify-center text-sm text-gray-500 py-2">
              <Filter className="w-4 h-4 mr-2" />
              Use filters to narrow results
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Active filters:</span>
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {categories.find(c => c.value === selectedCategory)?.label}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => setSelectedCategory('all')}
              />
            </Badge>
          )}
          {selectedDietary !== 'all' && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {dietaryOptions.find(d => d.value === selectedDietary)?.label}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => setSelectedDietary('all')}
              />
            </Badge>
          )}
          {priceRange < 50 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Under ${priceRange}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => setPriceRange(50)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
