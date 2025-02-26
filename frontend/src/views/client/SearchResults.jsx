import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const { query } = useParams();
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/searchuser/${query}`);
        // Ensure we're setting an array
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
    history.push(`/client/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Results Found</h2>
          <p className="text-gray-600">No users found matching "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center space-x-4">
              <img
                src={user.photoURL || 'https://via.placeholder.com/100'}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-main"
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
                className="bg-main text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-300"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
