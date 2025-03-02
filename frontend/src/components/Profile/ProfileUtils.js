// Utility functions for profile management

// Format the profile photo URL
export const getProfilePhotoUrl = (photoUrl) => {
  // If no photo URL is provided, return a default avatar
  if (!photoUrl) {
    return "https://demos.creative-tim.com/notus-react/static/media/team-1-800x800.fa5a7ac2.jpg";
  }

  // If it's a full URL, return it directly
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  // If it's a relative path, prepend the base URL
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${BASE_URL}${photoUrl}`;
};

// Validate file before upload
export const validateProfilePhoto = (file) => {
  // Check if file exists
  if (!file) return { isValid: false, error: 'No file selected' };

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please upload an image file' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size should be less than 5MB' };
  }

  return { isValid: true, error: null };
};

// Format date for profile display
export const formatDate = (date) => {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format user status for display
export const formatStatus = (status) => {
  if (!status) return { text: 'Not specified', className: '' };

  return {
    text: status,
    className: status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  };
};

// Format user role for display
export const formatRole = (role) => {
  if (!role) return 'Not specified';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Get field display value
export const getFieldDisplayValue = (value, defaultValue = 'Not specified') => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

// Format statistics for display
export const formatStats = (userData) => {
  return [
    {
      label: 'Skills',
      value: userData.skills?.length || 0
    },
    {
      label: 'Exchanges',
      value: userData.exchanges?.length || 0
    },
    {
      label: 'Rating',
      value: userData.rating || 0
    }
  ];
};
