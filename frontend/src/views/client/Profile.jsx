import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import toast from 'react-hot-toast';
import { Context } from "../../components/AuthProvider/AuthProvider";
import {
  getProfilePhotoUrl,
  validateProfilePhoto,
  formatDate,
  formatStatus,
  formatRole,
  getFieldDisplayValue,
  formatStats
} from "../../components/Profile/ProfileUtils";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const history = useHistory();

  // Get authenticated user from context
  const { user } = useContext(Context);

  // Get ID from URL params if provided, otherwise use authenticated user's ID
  const { id } = useParams();
  const userId = id || user?._id;
  const isOwnProfile = user && userId === user._id;

  // Check authentication and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      // If no user is logged in and no specific ID is provided, redirect to login
      if (!user && !id) {
        toast.error("Please log in to view profile");
        history.push('/auth/signin');
        return;
      }

      // If we have an ID (either from params or user context), fetch the data
      if (userId) {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:5000/api/users/user/${userId}`, {
            withCredentials: true
          });
          console.log('User data:', response.data);
          setUserData(response.data);
          setEditedData(response.data);
        } catch (err) {
          console.error('Error fetching user data:', err);
          toast.error('Failed to load profile data');
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, user, id, history]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/users/updateuser/${userId}`, editedData);
      setUserData(response.data);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès!');
    } catch (err) {
      console.error('Update Error:', err);
      toast.error('Error updating profile');
    }
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/updateuser/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data) {
        setUserData(prev => ({
          ...prev,
          photoURL: response.data.photoURL
        }));
        toast.success('Profile picture updated successfully!');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error('Failed to update profile picture');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">User not found</div>
      </div>
    );
  }

  const renderTableCell = (label, field, type = "text") => {
    const nonEditableFields = ['wallets', 'createdAt', 'role', 'status'];

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 bg-gray-50 w-1/3">
          <div className="text-sm font-medium text-gray-900">{label}</div>
        </td>
        <td className="px-6 py-4">
          {isEditing && !nonEditableFields.includes(field) ? (
            type === "textarea" ? (
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
                value={editedData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                rows="4"
              />
            ) : (
              <input
                type={type}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                value={editedData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )
          ) : (
            <div className="text-sm text-gray-900 py-2">
              {field === 'createdAt'
                ? formatDate(userData[field])
                : field === 'wallets'
                  ? `${getFieldDisplayValue(userData[field], 0)} credits`
                  : field === 'status'
                    ? (() => {
                      const status = formatStatus(userData[field]);
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.text}
                        </span>
                      );
                    })()
                    : field === 'role'
                      ? <span className="capitalize">{formatRole(userData[field])}</span>
                      : getFieldDisplayValue(userData[field])}
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <main className="profile-page">
        <section className="relative block h-[500px]">
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
            }}
          >
            <span
              id="blackOverlay"
              className="w-full h-full absolute opacity-50 bg-black"
            ></span>
          </div>
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-[70px]"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="text-gray-200 fill-current"
                points="2560 0 2560 100 0 100"
              ></polygon>
            </svg>
          </div>
        </section>
        <section className="relative py-16 bg-gray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div
                      className="relative"
                      onMouseEnter={() => isOwnProfile && setIsHoveringPhoto(true)}
                      onMouseLeave={() => isOwnProfile && setIsHoveringPhoto(false)}
                    >
                      <img
                        alt="Profile"
                        src={userData?.photoURL
                          ? `http://localhost:5000/${userData.photoURL}`
                          : "https://demos.creative-tim.com/notus-react/static/media/team-2-800x800.3e08ef14.jpg"
                        }
                        className="shadow-xl rounded-full h-[150px] w-[150px] align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 object-cover"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.target.src = "https://demos.creative-tim.com/notus-react/static/media/team-2-800x800.3e08ef14.jpg";
                        }}
                      />
                      {isOwnProfile && (
                        <>
                          {isHoveringPhoto && (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer h-[150px] w-[150px] -m-16 -ml-20 lg:-ml-16"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <div className="text-center">
                                <i className="fas fa-camera text-white text-xl mb-2"></i>
                                <p className="text-white text-sm">Change Photo</p>
                              </div>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      <button
                        className="bg-blue-500 active:bg-blue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => history.push('/client')}
                      >
                        Back to Dashboard
                      </button>
                      {!isOwnProfile && (
                        <button
                          className="bg-blue-500 active:bg-blue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          Request Exchange
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="flex justify-center py-4 lg:pt-4 pt-8">
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-gray-600">
                          {userData.skills?.length || 0}
                        </span>
                        <span className="text-sm text-gray-400">
                          Skills
                        </span>
                      </div>
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-gray-600">
                          {userData.exchanges?.length || 0}
                        </span>
                        <span className="text-sm text-gray-400">
                          Exchanges
                        </span>
                      </div>
                      <div className="lg:mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-gray-600">
                          {userData.rating || 0}
                        </span>
                        <span className="text-sm text-gray-400">
                          Rating
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-12">
                  <h3 className="text-4xl font-semibold leading-normal mb-2 text-gray-700">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <div className="text-sm leading-normal mt-0 mb-2 text-gray-400 font-bold uppercase">
                    <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-400"></i>
                    {userData.location || "Location not specified"}
                  </div>
                  <div className="mb-2 text-gray-600 mt-10">
                    <i className="fas fa-briefcase mr-2 text-lg text-gray-400"></i>
                    {userData.profession || "Profession not specified"}
                  </div>
                  <div className="mb-2 text-gray-600">
                    <i className="fas fa-university mr-2 text-lg text-gray-400"></i>
                    {userData.experience || "Experience not specified"}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mt-10 border-t border-gray-200">
                  <div className="flex justify-center mt-6">
                    <button
                      className={`px-4 py-2 mx-2 font-semibold ${activeTab === "info"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-500"
                        }`}
                      onClick={() => setActiveTab("info")}
                    >
                      Information
                    </button>
                    <button
                      className={`px-4 py-2 mx-2 font-semibold ${activeTab === "skills"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-500"
                        }`}
                      onClick={() => setActiveTab("skills")}
                    >
                      Skills
                    </button>
                    <button
                      className={`px-4 py-2 mx-2 font-semibold ${activeTab === "availability"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-500"
                        }`}
                      onClick={() => setActiveTab("availability")}
                    >
                      Availability
                    </button>
                    <button
                      className={`px-4 py-2 mx-2 font-semibold ${activeTab === "reviews"
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-500"
                        }`}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Reviews
                    </button>
                  </div>

                  {/* User Information Tab Content */}
                  {activeTab === "info" && (
                    <div className="py-8 px-4">
                      <div className="flex justify-end mb-4">
                        {isEditing ? (
                          <div className="space-x-2">
                            <button
                              onClick={handleSave}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full">
                          <tbody className="divide-y divide-gray-200">
                            {renderTableCell("Username", "username")}
                            {renderTableCell("First Name", "firstName")}
                            {renderTableCell("Last Name", "lastName")}
                            {renderTableCell("Email", "email", "email")}
                            {renderTableCell("Phone Number", "phoneNumber", "tel")}
                            {renderTableCell("Role", "role")}
                            {renderTableCell("Status", "status")}
                            {userData.role === 'teacher' && renderTableCell("Teaching Subjects", "teachingSubjects")}
                            {userData.role === 'teacher' && renderTableCell("Certification", "certification")}
                            {renderTableCell("Wallets", "wallets", "number")}
                            {renderTableCell("Member Since", "createdAt")}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Skills Tab Content */}
                  {activeTab === "skills" && (
                    <div className="py-8 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-4">Skills Interested In</h4>
                          <div className="space-y-3">
                            {(userData.skillsInterested || []).map((skill, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-700">{skill}</span>
                              </div>
                            ))}
                            {(!userData.skillsInterested || userData.skillsInterested.length === 0) && (
                              <div className="text-gray-500">No skills listed</div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-4">Teaching Subjects</h4>
                          <div className="space-y-3">
                            {(userData.teachingSubjects || []).map((subject, index) => (
                              <div key={index} className="text-gray-700">{subject}</div>
                            ))}
                            {(!userData.teachingSubjects || userData.teachingSubjects.length === 0) && (
                              <div className="text-gray-500">No teaching subjects listed</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Availability Tab Content */}
                  {activeTab === "availability" && (
                    <div className="py-8 px-4">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4">Available Time Slots</h4>
                        <div className="space-y-4">
                          {(userData.availability || []).map((slot) => (
                            <div key={slot.day} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                              <span className="font-medium text-gray-700">{slot.day}</span>
                              <span className="text-gray-600">{slot.time}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                          All times are in {userData.timezone || "Local Time"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab Content */}
                  {activeTab === "reviews" && (
                    <div className="py-8 px-4">
                      <div className="space-y-6">
                        {(userData.reviews || []).map((review) => (
                          <div key={review._id} className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-700">{review.author}</h5>
                                <div className="text-yellow-400 text-sm mt-1">
                                  {"★".repeat(Math.floor(review.rating))}
                                  {review.rating % 1 === 0.5 ? "½" : ""}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="mt-3 text-gray-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
