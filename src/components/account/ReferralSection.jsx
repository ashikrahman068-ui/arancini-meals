
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  DollarSign,
  Mail,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralSection({ user, onUserUpdate }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  const referralUrl = user?.referral_code
    ? `${window.location.origin}?ref=${user.referral_code}`
    : '';

  useEffect(() => {
    if (user?.email) {
      fetchReferrals();
      ensureReferralCode();
    }
  }, [user?.email]);

  const ensureReferralCode = async () => {
    if (!user.referral_code) {
      setGeneratingCode(true);
      try {
        const newCode = generateReferralCode();
        await base44.auth.updateMe({ referral_code: newCode });
        toast.success('Your referral code has been generated!');

        // Refresh user data in parent component
        if (onUserUpdate) {
          await onUserUpdate();
        }
      } catch (error) {
        console.error('Error generating referral code:', error);
        toast.error('Failed to generate referral code');
      } finally {
        setGeneratingCode(false);
      }
    }
  };

  const generateReferralCode = () => {
    const name = user.full_name?.split(' ')[0]?.toUpperCase() || 'USER';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${name}${random}`;
  };

  const fetchReferrals = async () => {
    try {
      const data = await base44.entities.Referral.filter({
        referrer_email: user.email
      });
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied!');
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent('Join Arancini Meals and Get $10 Off!');
    const body = encodeURIComponent(
      `Hey! I've been loving Arancini Meals and thought you might enjoy it too. Use my referral code ${user.referral_code} or this link to get $10 off your first subscription:\n\n${referralUrl}\n\nHealthy eating made easy!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareViaFacebook = () => {
    const url = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareViaTwitter = () => {
    const text = encodeURIComponent(`Join me on Arancini Meals and get $10 off your first subscription! Use code ${user.referral_code}`);
    const url = encodeURIComponent(referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareViaInstagram = () => {
    const message = `Join me on Arancini Meals and get $10 off your first subscription! Use code ${user.referral_code}\n\n${referralUrl}`;
    navigator.clipboard.writeText(message);
    toast.success('Message copied! Now paste it in your Instagram post or story');
  };

  const handleShareMore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Arancini Meals',
          text: `Use my code ${user.referral_code} for $10 off!`,
          url: referralUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name === 'AbortError') {
          // User cancelled the share, don't show error
          return;
        }
        // For other errors, fallback to copying the link
        navigator.clipboard.writeText(referralUrl);
        toast.info('Link copied to clipboard instead');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(referralUrl);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');

  if (generatingCode) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
          <p className="text-gray-600">Generating your unique referral code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Program Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Refer Friends, Earn Rewards!</h3>
              <p className="text-gray-700 mb-4">
                Give your friends $10 off their first subscription and earn $20 credit for each successful referral!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-600">You Earn: $20 Credit</Badge>
                <Badge className="bg-blue-600">They Get: $10 Off</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{user.total_referrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">${user.referral_credits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Pending Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReferrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Your Code */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Code</CardTitle>
          <CardDescription>
            Share your unique code with friends and family
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <Input
                value={user.referral_code || ''}
                readOnly
                className="text-lg font-mono font-bold"
              />
              <Button onClick={handleCopyCode} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Referral Link
            </label>
            <div className="flex gap-2">
              <Input
                value={referralUrl}
                readOnly
                className="text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Share via Social Media
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleShareViaEmail}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleShareViaFacebook}
                variant="outline"
                className="w-full bg-blue-50 hover:bg-blue-100"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                onClick={handleShareViaInstagram}
                variant="outline"
                className="w-full bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266-.058-1.644-.07-4.85-.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </Button>
              <Button
                onClick={handleShareMore}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start sharing your code to earn rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.referred_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {referral.completion_date
                        ? new Date(referral.completion_date).toLocaleDateString()
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        +${referral.referrer_reward_amount || 20}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Share Your Code</h4>
                <p className="text-sm text-gray-600">
                  Send your unique referral code to friends via email or social media
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">They Subscribe</h4>
                <p className="text-sm text-gray-600">
                  Your friend uses your code and subscribes to any meal plan
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">You Both Win</h4>
                <p className="text-sm text-gray-600">
                  They get $10 off, you earn $20 credit towards future orders!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
