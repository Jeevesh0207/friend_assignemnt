import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, UserMinus, Users, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSpring, animated } from '@react-spring/web';

interface User {
  _id: string;
  username: string;
}

interface FriendRequest {
  _id: string;
  from: User;
  status: string;
}

interface FriendRecommendation {
  user: User;
  mutualFriends: number;
}

function Home() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [recommendations, setRecommendations] = useState<FriendRecommendation[]>([]);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState({
    search: false,
    friends: false,
    requests: false,
    recommendations: false,
  });

  const floatAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(-10px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    const name = localStorage.getItem('username');
    if (name) {
      setUsername(name);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRecommendations();
    fetchFriendRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchFriendRequests = async () => {
    try {
      setLoading((prev) => ({ ...prev, requests: true }));
      const response = await axios.get('https://friend-assignemnt.vercel.app/api/friends/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequests(response.data);
    } catch (error) {
      toast.error('Failed to load friend requests');
    } finally {
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading((prev) => ({ ...prev, friends: true }));
      const response = await axios.get('https://friend-assignemnt.vercel.app/api/users/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data);
    } catch (error) {
      toast.error('Failed to load friends');
    } finally {
      setLoading((prev) => ({ ...prev, friends: false }));
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading((prev) => ({ ...prev, recommendations: true }));
      const response = await axios.get('https://friend-assignemnt.vercel.app/api/friends/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading((prev) => ({ ...prev, recommendations: false }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading((prev) => ({ ...prev, search: true }));
      const response = await axios.get(`https://friend-assignemnt.vercel.app/api/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading((prev) => ({ ...prev, search: false }));
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      await axios.post(
        `https://friend-assignemnt.vercel.app/api/friends/request/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(users.filter((user) => user._id !== userId));
      fetchRecommendations();
      toast.success('Friend request sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleFriendRequest = async (userId: string, status: 'accepted' | 'rejected') => {
    try {
      await axios.put(
        `https://friend-assignemnt.vercel.app/api/friends/request/${userId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendRequests();
      if (status === 'accepted') {
        fetchFriends();
        fetchRecommendations();
        toast.success('Friend request accepted');
      } else {
        toast.success('Friend request rejected');
      }
    } catch (error) {
      toast.error('Failed to handle friend request');
    }
  };

  const removeFriend = async (userId: string) => {
    try {
      await axios.delete(`https://friend-assignemnt.vercel.app/api/friends/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFriends();
      fetchRecommendations();
      toast.success('Friend removed successfully');
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };


  return (
    <div className="min-h-screen">
      <nav className="glass-card shadow-glass rounded-none flex justify-center">
        <div className="container px-4 py-4 flex justify-between items-center">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r text-mint bg-clip-text text-transparent"
          >
            Social Network - {username}
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="glass-button flex items-center gap-2 px-4 py-2"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search users..."
              className="glass-input flex-1 p-3"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading.search}
              className="glass-button px-6 py-3 flex items-center gap-2"
            >
              <Search size={20} />
              {loading.search ? 'Searching...' : 'Search'}
            </motion.button>
          </div>

          <AnimatePresence>
            {users.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4"
              >
                <div className="glass-card p-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Search Results</h3>
                  {users.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-blue-900 dark:text-blue-100">{user.username}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendFriendRequest(user._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <UserPlus size={20} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {friendRequests.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-8"
            >
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <animated.div style={floatAnimation}>
                    <Bell className="text-mint" size={24} />
                  </animated.div>
                  Friend Requests
                </h2>
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-700/30 rounded-lg"
                    >
                      <span className="font-medium text-blue-900 dark:text-blue-100">{request.from.username}</span>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFriendRequest(request.from._id, 'accepted')}
                          className="glass-button px-4 py-2"
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFriendRequest(request.from._id, 'rejected')}
                          className="glass-button px-4 py-2 bg-red-500/30 hover:bg-red-500/40"
                        >
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Users className="text-mint" size={24} />
                Friends
              </h2>
              <div className="space-y-4">
                {friends.length === 0 ? (
                  <p className="text-blue-900/70 dark:text-blue-100/70 text-center py-8">No friends yet</p>
                ) : (
                  friends.map((friend) => (
                    <motion.div
                      key={friend._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-700/30 rounded-lg"
                    >
                      <span className="font-medium text-blue-900 dark:text-blue-100">{friend.username}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFriend(friend._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <UserMinus size={20} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">Recommended Friends</h2>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <p className="text-blue-900/70 dark:text-blue-100/70 text-center py-8">No recommendations available</p>
                ) : (
                  recommendations.map(({ user, mutualFriends }) => (
                    <motion.div
                      key={user._id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-700/30 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-blue-900 dark:text-blue-100">{user.username}</span>
                        <p className="text-sm text-blue-900/70 dark:text-blue-100/70">{mutualFriends} mutual friends</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendFriendRequest(user._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <UserPlus size={20} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;