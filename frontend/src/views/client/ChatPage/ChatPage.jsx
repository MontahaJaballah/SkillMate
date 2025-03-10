import React, { useState, useEffect } from "react";
import axios from "axios";
import Chat from "../../../components/Chat/Chat";
import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

const ChatPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("friends"); // "friends", "requests", "find"
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!user?._id) {
      console.log("No user ID available");
      return;
    }

    // Connect to socket.io and identify the user
    socket.emit('user_connected', user._id);

    // Listen for friend request events
    socket.on('friend_request_received', ({ requesterId }) => {
      toast.success('You received a new friend request!');
      fetchPendingRequests();
    });

    socket.on('friend_request_accepted', ({ recipientId }) => {
      toast.success('Friend request accepted!');
      fetchFriends();
    });

    // Fetch friends
    setLoading(true);
    fetchFriends();
    fetchPendingRequests();

    // Cleanup socket listeners
    return () => {
      socket.off('friend_request_received');
      socket.off('friend_request_accepted');
    };
  }, [user?._id]); // Changed dependency to user?._id

  const fetchFriends = async () => {
    if (!user?._id) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/friends/list/${user._id}`);
      setFriends(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setLoading(false);
      toast.error("Failed to fetch friends");
    }
  };

  const fetchPendingRequests = async () => {
    if (!user?._id) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/friends/pending/${user._id}`);
      setPendingRequests(res.data);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      toast.error("Failed to fetch pending requests");
    }
  };

  const handleAcceptRequest = async (requestId, requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/friends/accept", { requestId });
      toast.success("Friend request accepted");
      // Emit socket event
      socket.emit('accept_friend_request', {
        requesterId: requesterId,
        recipientId: user._id
      });
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post("http://localhost:5000/api/friends/reject", { requestId });
      toast.success("Friend request rejected");
      await fetchPendingRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Failed to reject request");
    }
  };

  const handleSendRequest = async (recipientId) => {
    if (!user?._id) {
      toast.error("You must be logged in to send friend requests");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/friends/send", {
        requesterId: user._id,
        recipientId
      });
      
      toast.success("Friend request sent");
      // Emit socket event
      socket.emit('send_friend_request', {
        requesterId: user._id,
        recipientId: recipientId
      });
      // Refresh search results
      await handleSearchUsers();
    } catch (err) {
      console.error("Error sending request:", err);
      if (err.response?.data?.status) {
        toast.error(`Request ${err.response.data.status}`);
      } else {
        toast.error("Failed to send request");
      }
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/users/allusers");
      // Filter out current user and existing friends
      const filteredUsers = res.data.filter((u) => {
        // Skip current user
        if (u._id === user._id) return false;
        
        // Check if already friends
        const isFriend = friends.some(friend => friend.user._id === u._id);
        if (isFriend) return false;
        
        // Check if name or username matches search term
        const fullName = u.firstName && u.lastName 
          ? `${u.firstName} ${u.lastName}` 
          : u.username || '';
        
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      
      setSearchResults(filteredUsers);
    } catch (err) {
      console.error("Error searching users:", err);
      toast.error("Failed to search users");
    }
  };

  // If user is not logged in, redirect to login page
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-main mb-4">Please Log In</h1>
        <p className="mb-8">You need to be logged in to access the chat feature.</p>
        <Link to="/auth/login" className="bg-main text-white px-6 py-2 rounded hover:bg-opacity-80 duration-300">
          Go to Login
        </Link>
      </div>
    );
  }

  const filteredFriends = friends.filter((friend) => {
    const friendUser = friend.user;
    const userName = friendUser.firstName && friendUser.lastName
      ? `${friendUser.firstName} ${friendUser.lastName}`
      : friendUser.username || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-main mb-8">Chat</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="mb-4">
            <div className="flex space-x-2 mb-4">
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'friends' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('friends')}
              >
                Friends
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'requests' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('requests')}
              >
                Requests {pendingRequests.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">{pendingRequests.length}</span>}
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'find' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('find')}
              >
                Find
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'find' ? "Search for users..." : "Search friends..."}
                className="w-full p-2 border rounded-md focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeTab === 'find') {
                    handleSearchUsers();
                  }
                }}
              />
              {activeTab === 'find' && (
                <button 
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={handleSearchUsers}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'friends' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Friends</h2>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                </div>
              ) : filteredFriends.length > 0 ? (
                <ul className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredFriends.map((friend) => (
                    <li
                      key={friend._id}
                      className={`p-3 rounded-md cursor-pointer flex items-center ${
                        selectedUser && selectedUser._id === friend.user._id
                          ? "bg-gradient-to-r from-violet-500 to-pink-500 bg-opacity-10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedUser(friend.user)}
                    >
                      <div className="relative">
                        <img
                          src={friend.user.photoURL || "https://via.placeholder.com/40"}
                          alt={friend.user.username}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${friend.user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {friend.user.firstName && friend.user.lastName
                            ? `${friend.user.firstName} ${friend.user.lastName}`
                            : friend.user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {friend.user.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-gray-500">No friends found. Add some friends to start chatting!</p>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Friend Requests</h2>
              {pendingRequests.length > 0 ? (
                <ul className="space-y-2 max-h-[500px] overflow-y-auto">
                  {pendingRequests.map((request) => (
                    <li key={request._id} className="p-3 rounded-md border border-gray-200">
                      <div className="flex items-center mb-2">
                        <img
                          src={request.requester.photoURL || "https://via.placeholder.com/40"}
                          alt={request.requester.username}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">
                            {request.requester.firstName && request.requester.lastName
                              ? `${request.requester.firstName} ${request.requester.lastName}`
                              : request.requester.username}
                          </p>
                          <p className="text-xs text-gray-500">{request.requester.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id, request.requester._id)}
                          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1 rounded text-sm hover:opacity-90"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-gray-500">No pending friend requests</p>
              )}
            </div>
          )}

          {activeTab === 'find' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Find Users</h2>
              {searchResults.length > 0 ? (
                <ul className="space-y-2 max-h-[500px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <li key={user._id} className="p-3 rounded-md border border-gray-200">
                      <div className="flex items-center mb-2">
                        <img
                          src={user.photoURL || "https://via.placeholder.com/40"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1 rounded text-sm hover:opacity-90"
                      >
                        Send Request
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  {searchTerm ? "No users found. Try a different search term." : "Search for users to connect with"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md h-[600px]">
          <Chat receiver={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
