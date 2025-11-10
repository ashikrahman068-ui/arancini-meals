
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User as UserIcon, LogOut, Gift, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReferralSection from '../components/account/ReferralSection';

export default function Account() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        activity_level: currentUser.activity_level || 'moderately_active',
        fitness_goal: currentUser.fitness_goal || 'maintain_weight',
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    // Refetch user data to get the latest updates (like referral code)
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Failed to refresh user data.');
    }
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const handleSelectChange = (id, value) => {
     setFormData(prev => ({...prev, [id]: value}));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await base44.auth.updateMe(formData);
      toast.success("Account updated successfully!");
      fetchUser();
    } catch (error) {
      toast.error("Failed to update account.");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };
  
  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Welcome'));
    toast.success("You have been logged out.");
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Account'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Your Account</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Log in to manage your profile, view your order history, and access exclusive features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={handleLogin}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Log In
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8"
                  onClick={handleLogin} // Assuming signup also goes through the same login flow for simplicity
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">With an account, you can:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">View and manage your orders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Track your deliveries in real-time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Save favorite meals and preferences</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Earn referral rewards and credits</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-1">Manage your profile and referrals</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="profile">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Gift className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input id="full_name" value={formData.full_name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} disabled />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="fitness_goal">Fitness Goal</Label>
                      <Select id="fitness_goal" value={formData.fitness_goal} onValueChange={(v) => handleSelectChange('fitness_goal', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose_weight">Lose Weight</SelectItem>
                          <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                          <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          <SelectItem value="improve_health">General Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="activity_level">Activity Level</Label>
                      <Select id="activity_level" value={formData.activity_level} onValueChange={(v) => handleSelectChange('activity_level', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updating}>
                      {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralSection user={user} onUserUpdate={handleUserUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
