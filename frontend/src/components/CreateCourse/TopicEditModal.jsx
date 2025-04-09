import React, { useState, useEffect } from 'react';
import { X, Upload, Link } from 'lucide-react';

const TopicEditModal = ({ isOpen, onClose, topic, onSave }) => {
  const [editedTopic, setEditedTopic] = useState({
    title: '',
    type: 'video',
    duration: 0,
    description: '',
    resources: [],
    videoUrl: '',
    videoType: 'youtube',
    uploadedVideo: null
  });

  const [videoError, setVideoError] = useState('');
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);

  useEffect(() => {
    // Always set default values first, then override with topic values if available
    const defaultValues = {
      title: '',
      type: 'video',
      duration: 0,
      description: '',
      resources: [],
      videoUrl: '',
      videoType: 'youtube',
      uploadedVideo: null
    };

    if (topic) {
      setEditedTopic({
        ...defaultValues,
        id: topic.id, // Make sure to preserve the ID
        title: topic.title || '',
        type: topic.type || 'video',
        duration: topic.duration || 0,
        description: topic.description || '',
        resources: topic.resources || [],
        videoUrl: topic.videoUrl || '',
        videoType: topic.videoType || 'youtube',
      });
    } else {
      setEditedTopic(defaultValues);
    }
  }, [topic]);

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const detectYouTubeDuration = async (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setVideoError('Invalid YouTube URL');
      return;
    }

    setIsLoadingDuration(true);
    try {
      // Use YouTube Data API to get video duration
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=AIzaSyDcUDB0tla8QZ9K38h2OPO0K8T_QArNXNc`);
      const data = await response.json();

      if (data.items && data.items[0]) {
        // Convert YouTube duration format (PT1H2M10S) to minutes
        const duration = data.items[0].contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);

        const totalMinutes = Math.ceil((hours * 3600 + minutes * 60 + seconds) / 60);
        setEditedTopic(prev => ({
          ...prev,
          duration: totalMinutes
        }));
        setVideoError('');
      }
    } catch (error) {
      console.error('Error fetching YouTube video duration:', error);
      setVideoError('Could not fetch video duration. Please enter it manually.');
    } finally {
      setIsLoadingDuration(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === 'videoType') {
      // Reset video-related fields when switching types
      setEditedTopic(prev => ({
        ...prev,
        videoType: value,
        videoUrl: '',
        uploadedVideo: null,
        duration: 0
      }));
      setVideoError('');
      return;
    }

    if (name === 'uploadedVideo' && files?.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        // Create video element to get duration
        const video = document.createElement('video');
        video.preload = 'metadata';

        setIsLoadingDuration(true);
        video.onloadedmetadata = () => {
          const durationInMinutes = Math.ceil(video.duration / 60);
          setEditedTopic(prev => ({
            ...prev,
            uploadedVideo: file,
            duration: durationInMinutes
          }));
          setVideoError('');
          setIsLoadingDuration(false);
        };

        video.onerror = () => {
          setVideoError('Error loading video. Please try another file.');
          setIsLoadingDuration(false);
        };

        video.src = URL.createObjectURL(file);
      } else {
        setVideoError('Please upload a valid video file');
      }
      return;
    }

    if (name === 'videoUrl' && value) {
      setEditedTopic(prev => ({
        ...prev,
        videoUrl: value,
        duration: 0
      }));

      // Auto-detect YouTube video duration
      if (value.includes('youtube.com/') || value.includes('youtu.be/')) {
        detectYouTubeDuration(value);
      }
    }

    setEditedTopic(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = () => {
    if (editedTopic.type === 'video') {
      if (editedTopic.videoType === 'youtube' && !editedTopic.videoUrl) {
        setVideoError('Please enter a YouTube video URL');
        return;
      }
      if (editedTopic.videoType === 'upload' && !editedTopic.uploadedVideo) {
        setVideoError('Please upload a video file');
        return;
      }
      if (editedTopic.duration === 0) {
        setVideoError('Video duration is required');
        return;
      }
    }

    onSave({
      ...editedTopic,
      duration: parseInt(editedTopic.duration) || 0,
      id: editedTopic.id
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Topic</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={editedTopic.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={editedTopic.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="video">Video</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          {editedTopic.type === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Video Type</label>
                <select
                  name="videoType"
                  value={editedTopic.videoType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="upload">Upload Video</option>
                </select>
              </div>

              <div>
                {editedTopic.videoType === 'youtube' ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">YouTube Video URL</label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={editedTopic.videoUrl}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Video</label>
                    <input
                      type="file"
                      name="uploadedVideo"
                      accept="video/*"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                )}

                {isLoadingDuration ? (
                  <p className="text-sm text-blue-500 mt-2">Detecting video duration...</p>
                ) : editedTopic.duration > 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    Video duration: {editedTopic.duration} minutes
                  </p>
                ) : null}
              </div>

              {videoError && (
                <p className="text-red-500 text-sm">{videoError}</p>
              )}
            </>
          )}

          {editedTopic.type !== 'video' && (
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={editedTopic.duration}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={editedTopic.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicEditModal;
