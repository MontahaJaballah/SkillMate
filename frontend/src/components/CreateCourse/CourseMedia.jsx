import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CourseMedia = ({ formData, handleInputChange }) => {
  const [uploadedImage, setUploadedImage] = useState(formData.thumbnail || null);
  const [isUploading, setIsUploading] = useState(false);
  const [localThumbnailUrl, setLocalThumbnailUrl] = useState(formData.thumbnail || '');

  const uploadFile = async (file) => {
    console.log('[CourseMedia] uploadFile called with file:', file.name, file.type, file.size);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!file.type || !validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (PNG, JPG, or GIF)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);

      console.log('[CourseMedia] Uploading file to server...');

      // Send the file to the server
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('[CourseMedia] Server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CourseMedia] Server error:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CourseMedia] Server response data:', data);

      if (!data.url) {
        throw new Error('No URL received from server');
      }

      // Update the preview and local state
      setUploadedImage(data.url);
      setLocalThumbnailUrl(data.url);

      // Update the parent component's state
      console.log('[CourseMedia] Updating parent state with URL:', data.url);
      handleInputChange({
        target: {
          name: 'thumbnail',
          value: data.url
        }
      });

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('[CourseMedia] Upload error:', error);
      toast.error(`Failed to upload image: ${error.message}`);
      // Reset the uploaded image if upload fails
      setUploadedImage(formData.thumbnail || null);
    } finally {
      setIsUploading(false);
    }
  };

  // Custom file picker function that uses the HTML5 File API directly
  const openFilePicker = () => {
    console.log('[CourseMedia] Opening file picker with HTML5 File API');

    // Create a temporary file input element
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = 'image/png,image/jpeg,image/gif';

    // Add event listener for file selection
    tempInput.addEventListener('change', (e) => {
      console.log('[CourseMedia] File selected via HTML5 File API');
      const file = e.target.files?.[0];
      if (file) {
        console.log('[CourseMedia] Selected file:', file.name, file.type, file.size);
        uploadFile(file);
      }
    });

    // Trigger the file picker
    tempInput.click();
  };

  // Keep states in sync with formData
  useEffect(() => {
    console.log('[CourseMedia] useEffect triggered with formData.thumbnail:', formData.thumbnail);
    setUploadedImage(formData.thumbnail || null);
    setLocalThumbnailUrl(formData.thumbnail || '');
  }, [formData.thumbnail]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    console.log('[CourseMedia] handleUrlChange with url:', url);
    setLocalThumbnailUrl(url);
    setUploadedImage(url);
    handleInputChange(e);
  };

  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Course media</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course thumbnail URL
          </label>
          <input
            type="text"
            name="thumbnail"
            placeholder="Enter thumbnail URL or YouTube video URL"
            value={localThumbnailUrl}
            onChange={handleUrlChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          />
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="text-lg font-semibold mb-4">Upload a thumbnail image</h5>

          {uploadedImage && (
            <div className="mb-4 flex justify-center">
              <img
                src={uploadedImage}
                alt="Thumbnail preview"
                className="max-w-full h-auto max-h-48 rounded-md"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isUploading}
                className="py-2 px-4 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 mb-2 cursor-pointer"
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMedia;