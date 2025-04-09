import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const CourseDetails = ({ formData, handleInputChange }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const response = await axios.get(`/skills/user/${user._id}`);
        setSkills(response.data);

        // If there's a saved skill, find its full details
        if (formData.skill) {
          const savedSkill = response.data.find(s => s._id === formData.skill);
          if (savedSkill) {
            setSelectedSkill(savedSkill);
          }
        }
      } catch (error) {
        console.error('Error fetching user skills:', error);
      }
    };

    if (user?._id) {
      fetchUserSkills();
    }
  }, [user?._id, formData.skill]);

  const handleSkillChange = (e) => {
    const skillId = e.target.value;
    const skill = skills.find(s => s._id === skillId);
    setSelectedSkill(skill);

    // Update both skill and category in formData
    handleInputChange({
      target: {
        name: 'skill',
        value: skillId
      }
    });
    if (skill) {
      handleInputChange({
        target: {
          name: 'category',
          value: skill.categorie
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Course details</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course title
          </label>
          <input
            type="text"
            name="courseTitle"
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
            placeholder="Enter course title"
            value={formData.courseTitle || ''}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Skill
          </label>
          <select
            name="skill"
            value={formData.skill || ''}
            onChange={handleSkillChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          >
            <option value="">Select a skill</option>
            {skills.map(skill => (
              <option key={skill._id} value={skill._id}>
                {skill.name} ({skill.categorie})
              </option>
            ))}
          </select>
          {selectedSkill && (
            <p className="mt-1 text-sm text-gray-500">
              Category: {selectedSkill.categorie}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short description
          </label>
          <textarea
            name="shortDescription"
            rows={2}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
            placeholder="Enter a short description"
            value={formData.shortDescription || ''}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course language
          </label>
          <select
            name="language"
            value={formData.language || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          >
            <option value="">Select a language</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="arabic">Arabic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course level
          </label>
          <select
            name="level"
            value={formData.level || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          >
            <option value="">Select level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course price
            </label>
            <input
              type="number"
              name="price"
              min="0"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter course price"
              value={formData.price || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount price
            </label>
            <input
              type="number"
              name="discount"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter discount price"
              value={formData.discount || ''}
              onChange={handleInputChange}
            />
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="enableDiscount"
                  checked={formData.enableDiscount || false}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Enable this Discount</span>
              </label>
            </div>          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
            placeholder="Enter course description"
            value={formData.description || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;