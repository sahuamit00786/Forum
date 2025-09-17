import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  MessageSquare,
  FileText,
  BookOpen,
  Heart,
  Users,
  Settings
} from 'lucide-react';
import { updateUserProfile } from '../store/slices/authSlice';
import { fetchProfileData } from '../store/slices/profileSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { profileData, loading: profileLoading, error } = useSelector((state) => state.profile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    userEmail: user?.userEmail || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    profilePhoto: user?.profilePhoto || null
  });

  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchProfileData());
    }
  }, [dispatch, user]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        profilePhoto: user.profilePhoto || null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const result = await dispatch(updateUserProfile(formData));
    if (updateUserProfile.fulfilled.match(result)) {
      setIsEditing(false);
      // Refresh profile data after update
      dispatch(fetchProfileData());
    }
  };

  const handleCancel = () => {
    setFormData({
      userName: user?.userName || '',
      userEmail: user?.userEmail || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      profilePhoto: user?.profilePhoto || null
    });
    setIsEditing(false);
  };

  // Get user stats and activity from profile data
  const userStats = profileData?.stats || {
    threadsCreated: 0,
    postsCount: 0,
    likesReceived: 0,
    following: 0,
    followers: 0
  };

  const recentActivity = profileData?.recentActivity || [];

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'activity', name: 'Activity', icon: MessageSquare },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  // Show loading state
  if (profileLoading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Profile</h2>
          <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4 space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-dark-700">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary-600 rounded-full flex items-center justify-center">
                {formData.profilePhoto ? (
                  <img 
                    src={formData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                    {formData.userName?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1 sm:p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-dark-600 focus:border-primary-500 outline-none text-gray-900 dark:text-white"
                  />
                ) : (
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.userName}
                  </h1>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-gray-300 dark:border-dark-600 focus:border-primary-500 outline-none text-gray-600 dark:text-gray-400 text-sm sm:text-base"
                    />
                  ) : (
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{user?.userEmail}</span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 sm:gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 sm:gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 sm:gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full p-2 sm:p-3 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {user?.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {/* Website (only show in edit mode) */}
            {isEditing && (
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-website.com"
                  className="w-full p-2 sm:p-3 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="bg-transparent border-b border-gray-300 dark:border-dark-600 focus:border-primary-500 outline-none text-xs sm:text-sm"
                  />
                ) : (
                  <span>{user?.location || 'Location not set'}</span>
                )}
              </div>
              {user?.website && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Website"
                      className="bg-transparent border-b border-gray-300 dark:border-dark-600 focus:border-primary-500 outline-none text-xs sm:text-sm"
                    />
                  ) : (
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {user.website}
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-dark-700">
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{userStats.threadsCreated}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Threads</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{userStats.postsCount}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{userStats.likesReceived}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{userStats.following}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{userStats.followers}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Followers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 px-3 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Activity</h3>
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          {activity.type === 'thread' && <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                          {activity.type === 'comment' && <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                          {activity.type === 'like' && <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                            You {activity.action} <strong>{activity.title}</strong>
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(activity.date)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Activity History</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Detailed activity history will be displayed here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Account Settings</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Account settings and preferences will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;