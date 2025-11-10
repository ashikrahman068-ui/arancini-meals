import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  Eye,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
      fetchPost(slug);
    }
  }, []);

  const fetchPost = async (slug) => {
    try {
      const posts = await base44.entities.BlogPost.filter({
        slug: slug,
        status: 'published'
      });

      if (posts.length > 0) {
        const currentPost = posts[0];
        setPost(currentPost);

        // Increment view count
        await base44.entities.BlogPost.update(currentPost.id, {
          views_count: (currentPost.views_count || 0) + 1
        });

        // Fetch related posts
        const related = await base44.entities.BlogPost.filter(
          {
            status: 'published',
            category: currentPost.category
          },
          '-published_date',
          4
        );
        setRelatedPosts(related.filter(p => p.id !== currentPost.id).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Link to={createPageUrl('Blog')}>
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl('Blog')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Badge className={`${getCategoryColor(post.category)} mb-4`}>
            {post.category}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author_name || 'Arancini Meals'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(post.published_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time || 5} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.views_count || 0} views</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('copy')}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-6 mb-4 text-gray-700">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 mb-4 text-gray-700">{children}</ol>,
                  li: ({children}) => <li className="mb-2">{children}</li>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({href, children}) => (
                    <a href={href} className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <>
                <Separator className="my-8" />
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link key={relatedPost.id} to={createPageUrl(`BlogPost?slug=${relatedPost.slug}`)}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                    <img
                      src={relatedPost.featured_image_url}
                      alt={relatedPost.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}