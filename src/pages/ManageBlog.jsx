
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Save,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import ResearchAssistant from '../components/blog/ResearchAssistant';

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category: 'nutrition',
    tags: [],
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    reading_time: 5,
    is_featured: false
  });

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchUserAndPosts = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.role !== 'admin') {
        toast.error('You need admin access to manage blog posts');
        return;
      }

      const allPosts = await base44.entities.BlogPost.list('-created_date');
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (id === 'title' && !formData.id) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, seo_keywords: keywords }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, featured_image_url: file_url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const postData = {
        ...formData,
        author_email: user.email,
        author_name: user.full_name,
        status: publishNow ? 'published' : formData.status,
        published_date: publishNow ? new Date().toISOString() : formData.published_date
      };

      if (formData.id) {
        await base44.entities.BlogPost.update(formData.id, postData);
        toast.success('Post updated successfully!');
      } else {
        await base44.entities.BlogPost.create(postData);
        toast.success('Post created successfully!');
      }

      setShowEditor(false);
      resetForm();
      fetchUserAndPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const handleEdit = (post) => {
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image_url: post.featured_image_url || '',
      category: post.category,
      tags: post.tags || [],
      status: post.status,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      seo_keywords: post.seo_keywords || [],
      reading_time: post.reading_time || 5,
      is_featured: post.is_featured || false,
      published_date: post.published_date
    });
    setShowEditor(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await base44.entities.BlogPost.delete(postToDelete.id);
      toast.success('Post deleted successfully!');
      fetchUserAndPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      category: 'nutrition',
      tags: [],
      status: 'draft',
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      reading_time: 5,
      is_featured: false
    });
  };

  const handleInsertResearch = (content) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + content
    }));
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    return post.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to manage blog posts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
            <p className="text-gray-600 mt-1">Create and manage SEO-optimized blog content</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowEditor(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Posts</div>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Published</div>
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(p => p.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Drafts</div>
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter(p => p.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Views</div>
              <div className="text-2xl font-bold text-blue-600">
                {posts.reduce((sum, p) => sum + (p.views_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                        {post.is_featured && (
                          <Badge className="bg-orange-500">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.views_count || 0} views</span>
                        <span>•</span>
                        <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPostToDelete(post);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              Write SEO-optimized content for your blog
            </DialogDescription>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-6 py-4">
            {/* Main Editor - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="post-url-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Short description of the post"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="recipes">Recipes</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                    <Input
                      id="reading_time"
                      type="number"
                      value={formData.reading_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="healthy eating, nutrition tips, recipes"
                  />
                </div>

                <div>
                  <Label>Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="featured_image_url"
                      value={formData.featured_image_url}
                      onChange={handleInputChange}
                      placeholder="Image URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload').click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {formData.featured_image_url && (
                    <img src={formData.featured_image_url} alt="Preview" className="mt-2 w-full h-40 object-cover rounded" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="is_featured">Feature this post</Label>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="content">Content (Markdown) *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="border rounded-lg p-4 min-h-[300px] prose max-w-none">
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your post content here (supports Markdown)"
                    rows={15}
                    className="font-mono"
                  />
                )}
              </div>

              {/* SEO Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">SEO Settings</h3>
                
                <div>
                  <Label htmlFor="seo_title">SEO Title (60 chars max)</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={handleInputChange}
                    placeholder="Optimized title for search engines"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seo_title.length}/60 characters</p>
                </div>

                <div>
                  <Label htmlFor="seo_description">SEO Description (160 chars max)</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={handleInputChange}
                    placeholder="Meta description for search results"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seo_description.length}/160 characters</p>
                </div>

                <div>
                  <Label htmlFor="seo_keywords">SEO Keywords (comma-separated)</Label>
                  <Input
                    id="seo_keywords"
                    value={formData.seo_keywords.join(', ')}
                    onChange={handleKeywordsChange}
                    placeholder="meal prep, healthy eating, nutrition"
                  />
                </div>
              </div>
            </div>

            {/* Research Assistant Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <ResearchAssistant onInsertContent={handleInsertResearch} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} className="bg-green-600 hover:bg-green-700">
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
