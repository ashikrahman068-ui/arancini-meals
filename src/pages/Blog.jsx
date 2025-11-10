import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  TrendingUp,
  User,
  Eye,
  Filter
} from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await base44.entities.BlogPost.filter(
        { status: 'published' },
        '-published_date'
      );
      setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts.find(p => p.is_featured);
  const categories = ['all', 'nutrition', 'recipes', 'health', 'lifestyle', 'news'];

  const getCategoryColor = (category) => {
    const colors = {
      nutrition: 'bg-green-100 text-green-700',
      recipes: 'bg-orange-100 text-orange-700',
      health: 'bg-blue-100 text-blue-700',
      lifestyle: 'bg-purple-100 text-purple-700',
      news: 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">Arancini Meals Blog</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Nutrition tips, healthy recipes, and wellness insights to help you live your best life
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="w-full h-96" />
            <div className="grid md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-full h-64" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && selectedCategory === 'all' && !searchTerm && (
              <Link to={createPageUrl(`BlogPost?slug=${featuredPost.slug}`)}>
                <Card className="mb-12 overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full overflow-hidden">
                      <img
                        src={featuredPost.featured_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-4 left-4 bg-orange-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center">
                      <Badge className={`${getCategoryColor(featuredPost.category)} w-fit mb-3`}>
                        {featuredPost.category}
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(featuredPost.published_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.reading_time || 5} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {featuredPost.views_count || 0} views
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )}

            {/* Blog Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                  <Link key={post.id} to={createPageUrl(`BlogPost?slug=${post.slug}`)}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className={`absolute top-3 right-3 ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </Badge>
                      </div>
                      <CardContent className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.reading_time || 5} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.published_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}