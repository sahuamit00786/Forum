import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MessageSquare, 
  Calendar,
  MapPin,
  Star,
  Crown
} from 'lucide-react';

// Add API call for users
import { adminAPI } from '../utils/api';

const Members = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Only fetch users if user is authenticated and is admin
        if (isAuthenticated && user?.roleId === 1) {
          const response = await adminAPI.getUsers();
          setUsers(response.users || []);
        } else {
          // For non-admin users, show empty array or fetch public user list
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user]);

  const filteredMembers = (users || []).filter(member => {
    const matchesSearch = member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'online' && member.isOnline) ||
                         (filterBy === 'admins' && member.roleId === 1);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Community Members</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Connect with fellow boating enthusiasts</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{(users || []).filter(m => m.isOnline).length} online</span>
          <span>•</span>
          <span>{(users || []).length} total members</span>
        </div>
      </div>

      {/* Access Control Message */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200">
              Please log in as an administrator to view community members.
            </p>
          </div>
        </div>
      )}

      {isAuthenticated && user?.roleId !== 1 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm sm:text-base text-red-800 dark:text-red-200">
              Administrator access required to view community members.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {(isAuthenticated && user?.roleId === 1) && (
        <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-dark-700">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Members</option>
                <option value="online">Online Now</option>
                <option value="admins">Administrators</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="recent">Recently Joined</option>
                <option value="active">Most Active</option>
                <option value="reputation">By Reputation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {(isAuthenticated && user?.roleId === 1) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading members...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member.userId} className="bg-white dark:bg-dark-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-shadow">
                {/* Member Header */}
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm sm:text-lg">
                        {member.userName[0].toUpperCase()}
                      </span>
                    </div>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                        {member.userName}
                      </h3>
                      {member.roleId === 1 && (
                        <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                        {member.role?.title || 'Member'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 truncate">{member.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Joined {formatDate(member.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/members/${member.userName}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    <span className="hidden sm:inline">View Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </Link>
                  {isAuthenticated && (
                    <button className="bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 p-2 rounded-lg transition-colors">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No members found</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;