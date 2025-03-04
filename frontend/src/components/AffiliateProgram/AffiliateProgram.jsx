import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Context } from "../AuthProvider/AuthProvider"; 

const AffiliateProgram = () => {
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(Context); 

  const API_BASE_URL = "http://localhost:5000/api/affiliate";

  useEffect(() => {
    if (user) {
      checkAffiliateStatus();
    }
  }, [user]);

  const checkAffiliateStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`, {
        headers: {
          "teacher-id": user._id
        },
        withCredentials: true
      });
      setStatus(response.data.status);
      setMetrics(response.data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Status check error:', error);
      if (error.response?.status === 404) {
        setStatus("not_applied");
      } else {
        setError(error.response?.data?.message || "Error fetching affiliate status");
      }
      setLoading(false);
    }
  };

  const applyForAffiliate = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/apply`, {}, {
        headers: {
          "teacher-id": user._id
        },
        withCredentials: true
      });

      setStatus(response.data.status);
      setMetrics(response.data.metrics);
      
      // Show success/rejection message
      if (response.data.status === "accepted") {
        // If accepted, download the contract
        if (response.data.contractUrl) {
          window.open(`http://localhost:5000${response.data.contractUrl}`, '_blank');
        }
      }
      alert(response.data.message);
      
    } catch (error) {
      console.error('Apply error:', error);
      setError(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6">
            <p className="text-center text-gray-600">Please log in to access the affiliate program.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-main to-blue-600 px-6 py-8 text-white">
            <h2 className="text-3xl font-bold">SkillMate Affiliate Program</h2>
            <p className="mt-2 text-blue-100">Unlock premium benefits and boost your earnings</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {status === "accepted" ? (
              <div>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Congratulations! You are a SkillMate Affiliate
                      </p>
                    </div>
                  </div>
                </div>

                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Students</span>
                          <span className="font-semibold text-gray-900">{metrics.totalStudents}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-semibold text-gray-900">${metrics.totalRevenue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rating</span>
                          <span className="font-semibold text-gray-900">{metrics.averageRating.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Courses</span>
                          <span className="font-semibold text-gray-900">{metrics.totalCourses}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>40% Revenue Share</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Priority Support</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Special Badge</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Featured Courses</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : status === "rejected" ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Sorry, you don't meet the requirements for the affiliate program at this time. Please check the requirements below and try again when you meet them.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    Join our exclusive affiliate program and unlock premium benefits that will help you grow your teaching business.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Increased revenue share (40%)</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Priority support access</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Special affiliate badge</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Featured course placement</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>5+ enrolled students</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>$100+ total revenue</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>3.5+ average rating</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-main mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>2+ published courses</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={applyForAffiliate}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main transition-colors disabled:opacity-50"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateProgram;
