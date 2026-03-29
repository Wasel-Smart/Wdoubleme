import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Heart, MessageCircle, Share2, MapPin, Clock, 
  UserPlus, Image, Send, MoreHorizontal, Award, Verified,
  ThumbsUp, Bookmark, Camera, Smile, Globe, Lock, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../../contexts/LanguageContext';
import { shareContent } from '../../hooks/useShare';

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    badge: string;
  };
  content: string;
  image?: string;
  trip?: {
    from: string;
    to: string;
    date: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  liked: boolean;
  bookmarked: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  trips: number;
  status: 'friend' | 'pending' | 'suggested';
}

interface TripStory {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  route: string;
  image: string;
  timestamp: string;
  viewed: boolean;
}

export function SocialHub() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'stories'>('feed');
  const [newPost, setNewPost] = useState('');

  const posts: Post[] = [
    {
      id: '1',
      user: {
        name: 'Ahmed Al-Saudi',
        avatar: '👨‍💼',
        verified: true,
        badge: 'Gold'
      },
      content: 'Just completed my 500th trip on Wasel! 🎉 The drivers are always professional and the app is so easy to use. Highly recommend! #WaselJourney #Milestone',
      trip: {
        from: 'Mall of Arabia',
        to: 'King Fahd Stadium',
        date: '2 hours ago'
      },
      likes: 127,
      comments: 23,
      shares: 12,
      timestamp: '2 hours ago',
      liked: false,
      bookmarked: false
    },
    {
      id: '2',
      user: {
        name: 'Sarah Johnson',
        avatar: '👩‍💻',
        verified: true,
        badge: 'Platinum'
      },
      content: 'Saved 45kg of CO2 this month by carpooling! 🌱 Let\'s make a difference together. Join me in going green!',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=500&fit=crop',
      likes: 245,
      comments: 38,
      shares: 67,
      timestamp: '5 hours ago',
      liked: true,
      bookmarked: true
    },
    {
      id: '3',
      user: {
        name: 'Mohammed Ali',
        avatar: '🧔',
        verified: false,
        badge: 'Silver'
      },
      content: 'Great carpooling trip with Wasel today! The traveler was on time, professional, and the car was comfortable. Perfect for intercity travel! 🚗',
      likes: 89,
      comments: 14,
      shares: 5,
      timestamp: '1 day ago',
      liked: false,
      bookmarked: false
    }
  ];

  const friends: Friend[] = [
    {
      id: '1',
      name: 'Fatima Hassan',
      avatar: '👩',
      mutualFriends: 12,
      trips: 234,
      status: 'friend'
    },
    {
      id: '2',
      name: 'John Smith',
      avatar: '👨',
      mutualFriends: 8,
      trips: 156,
      status: 'friend'
    },
    {
      id: '3',
      name: 'Layla Ahmed',
      avatar: '👧',
      mutualFriends: 5,
      trips: 89,
      status: 'pending'
    },
    {
      id: '4',
      name: 'Omar Abdullah',
      avatar: '🧑',
      mutualFriends: 15,
      trips: 312,
      status: 'suggested'
    }
  ];

  const stories: TripStory[] = [
    {
      id: '1',
      user: { name: 'Ahmed', avatar: '👨‍💼' },
      route: 'Downtown → Airport',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=300&h=400&fit=crop',
      timestamp: '2h ago',
      viewed: false
    },
    {
      id: '2',
      user: { name: 'Sarah', avatar: '👩‍💻' },
      route: 'Marina → Mall',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=400&fit=crop',
      timestamp: '5h ago',
      viewed: true
    },
    {
      id: '3',
      user: { name: 'Mohammed', avatar: '🧔' },
      route: 'Office → Home',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
      timestamp: '8h ago',
      viewed: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isRTL ? 'المجتمع الاجتماعي' : 'Social Hub'}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'شارك رحلاتك، تواصل مع الأصدقاء، وانضم إلى مجتمع واصل'
              : 'Share your trips, connect with friends, and join the Wasel community'}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{isRTL ? 'الصفحة الرئيسية' : 'Feed'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>{isRTL ? 'الأصدقاء' : 'Friends'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'stories'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              <span>{isRTL ? 'القصص' : 'Stories'}</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <>
                {/* Create Post */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                          😊
                        </div>
                        <div className="flex-1">
                          <Textarea
                            placeholder={isRTL ? 'ما الذي تريد مشاركته؟' : "What's on your mind?"}
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="mb-3"
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Image className="w-4 h-4 mr-2" />
                                {isRTL ? 'صورة' : 'Photo'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <MapPin className="w-4 h-4 mr-2" />
                                {isRTL ? 'موقع' : 'Location'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Smile className="w-4 h-4 mr-2" />
                                {isRTL ? 'مشاعر' : 'Feeling'}
                              </Button>
                            </div>
                            <Button>
                              <Send className="w-4 h-4 mr-2" />
                              {isRTL ? 'نشر' : 'Post'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Posts */}
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                              {post.user.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{post.user.name}</h3>
                                {post.user.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                                  {post.user.badge}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Content */}
                        <p className="text-sm leading-relaxed">{post.content}</p>

                        {/* Trip Info */}
                        {post.trip && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{post.trip.from} → {post.trip.to}</p>
                              <p className="text-xs text-muted-foreground">{post.trip.date}</p>
                            </div>
                          </div>
                        )}

                        {/* Image */}
                        {post.image && (
                          <img 
                            src={post.image} 
                            alt="Post" 
                            className="w-full rounded-lg object-cover max-h-96"
                          />
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-y border-gray-200 dark:border-gray-700 py-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-around">
                          <Button 
                            variant="ghost" 
                            className={post.liked ? 'text-red-600' : ''}
                          >
                            <Heart className={`w-5 h-5 mr-2 ${post.liked ? 'fill-red-600' : ''}`} />
                            {isRTL ? 'إعجاب' : 'Like'}
                          </Button>
                          <Button variant="ghost">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {isRTL ? 'تعليق' : 'Comment'}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => shareContent({
                              title: isRTL ? `واصل — منشور ${post.user.name}` : `Wasel — Post by ${post.user.name}`,
                              text: post.content.slice(0, 120) + (post.content.length > 120 ? '...' : ''),
                              url: `${window.location.origin}/app/social/post/${post.id}`,
                              successMessage: 'Post link copied!',
                              successMessageAr: 'تم نسخ رابط المنشور!',
                              isRTL,
                            })}
                          >
                            <Share2 className="w-5 h-5 mr-2" />
                            {isRTL ? 'مشاركة' : 'Share'}
                          </Button>
                          <Button variant="ghost">
                            <Bookmark className={`w-5 h-5 mr-2 ${post.bookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
                            {isRTL ? 'حفظ' : 'Save'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="grid gap-4">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl">
                              {friend.avatar}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{friend.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {friend.mutualFriends} {isRTL ? 'أصدقاء مشتركين' : 'mutual friends'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {friend.trips} {isRTL ? 'رحلة' : 'trips'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {friend.status === 'friend' && (
                              <>
                                <Button variant="outline">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  {isRTL ? 'رسالة' : 'Message'}
                                </Button>
                                <Button variant="outline">
                                  <Users className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {friend.status === 'pending' && (
                              <Button>
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isRTL ? 'قبول' : 'Accept'}
                              </Button>
                            )}
                            {friend.status === 'suggested' && (
                              <Button variant="outline">
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isRTL ? 'إضافة صديق' : 'Add Friend'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stories Tab */}
            {activeTab === 'stories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={story.image} 
                          alt={story.route} 
                          className={`w-full h-64 object-cover ${story.viewed ? 'opacity-60' : ''}`}
                        />
                        <div className="absolute top-3 left-3">
                          <div className={`w-12 h-12 rounded-full ${story.viewed ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center text-white text-2xl border-4 border-white`}>
                            {story.user.avatar}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                          <p className="font-semibold">{story.user.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{story.route}</span>
                          </div>
                          <p className="text-xs opacity-80">{story.timestamp}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Add Story */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: stories.length * 0.1 }}
                >
                  <Card className="h-64 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl mx-auto mb-3">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="font-semibold">{isRTL ? 'أضف قصتك' : 'Add Your Story'}</p>
                    </div>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  {isRTL ? 'المواضيع الرائجة' : 'Trending Topics'}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { topic: '#WaselJourney', posts: '2.5K' },
                  { topic: '#EcoFriendly', posts: '1.8K' },
                  { topic: '#Carpool', posts: '1.2K' },
                  { topic: '#SafeTravel', posts: '987' }
                ].map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-semibold text-blue-600">{trend.topic}</p>
                      <p className="text-xs text-muted-foreground">{trend.posts} {isRTL ? 'منشور' : 'posts'}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Friends */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  {isRTL ? 'اقتراحات الأصدقاء' : 'Suggested Friends'}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {friends.filter(f => f.status === 'suggested').slice(0, 3).map((friend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {friend.mutualFriends} {isRTL ? 'مشترك' : 'mutual'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}