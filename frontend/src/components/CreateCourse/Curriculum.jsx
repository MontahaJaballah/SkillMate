import React from 'react';
import { X, Edit2, Play, Plus, PlusCircle } from 'lucide-react';

const Curriculum = ({
  lectures,
  showAddLectureModal,
  showAddTopicModal,
  formData,
  handleInputChange,
  setShowAddLectureModal,
  setShowAddTopicModal,
  handleAddLecture,
  handleAddTopic,
  handleDeleteTopic,
  setFormData
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Curriculum</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="flex justify-between items-center">
        <h5 className="text-xl font-semibold">Upload Lecture</h5>
        <button
          onClick={() => setShowAddLectureModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-blue-500 bg-blue-50 dark:bg-blue-900 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
        >
          <PlusCircle size={18} />
          Add Lecture
        </button>
      </div>

      <div className="space-y-4">
        {lectures.map(lecture => (
          <div key={lecture.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h6 className="font-semibold">{lecture.title}</h6>
            </div>
            <div className="p-4 space-y-4">
              {lecture.topics.map(topic => (
                <div key={topic.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-red-50 dark:bg-red-900 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                      <Play size={16} />
                    </button>
                    <span>{topic.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-50 dark:bg-green-900 text-green-600 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(lecture.id, topic.id)}
                      className="p-2 bg-red-50 dark:bg-red-900 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <hr className="border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, newTopicLectureId: lecture.id }));
                  setShowAddTopicModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gray-900 dark:bg-gray-700 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus size={18} />
                Add topic
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Lecture Modal */}
      {showAddLectureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Lecture</h3>
            <input
              type="text"
              name="newLectureTitle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4"
              placeholder="Enter lecture title"
              value={formData.newLectureTitle}
              onChange={handleInputChange}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddLectureModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLecture}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Topic</h3>
            <input
              type="text"
              name="newTopicTitle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mb-4"
              placeholder="Enter topic title"
              value={formData.newTopicTitle}
              onChange={handleInputChange}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTopic(formData.newTopicLectureId)}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;