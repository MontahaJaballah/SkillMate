import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/searchuser/${query}`);
        setUsers(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch search results');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchUsers();
    }
  }, [query]);

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative pt-32 pb-32 bg-gradient-to-r from-violet-500 to-pink-500">
        <div className="px-4 md:px-6 mx-auto w-full">
          <div className="text-center text-white">
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="relative pt-32 pb-32 bg-gradient-to-r from-violet-500 to-pink-500">
        <div className="px-4 md:px-6 mx-auto w-full">
          <div className="text-center text-white">
            <h2 className="text-2xl font-semibold mb-2">No Results Found</h2>
            <p>No users found matching "{query}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-32 bg-gradient-to-r from-violet-500 to-pink-500">
      <div className="px-4 md:px-6 mx-auto w-full">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-semibold">Search Results for "{query}"</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/100'}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>
              {user.bio && (
                <p className="mt-4 text-gray-700 line-clamp-3">{user.bio}</p>
              )}
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => handleViewProfile(user._id)}
                  className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-300"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
