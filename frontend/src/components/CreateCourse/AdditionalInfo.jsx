import React, { useState } from 'react';
import { Edit2, X, PlusCircle, Check } from 'lucide-react';

const AdditionalInfo = ({ formData, handleInputChange }) => {
  const [tagsInput, setTagsInput] = useState(Array.isArray(formData.tags) ? formData.tags.join(', ') : '');
  const [faqs, setFaqs] = useState(formData.faqs || []);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [editingFaq, setEditingFaq] = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);

  const handleTagsChange = (e) => {
    const newValue = e.target.value;
    setTagsInput(newValue);

    // Only update formData when we have valid tags
    const tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange({
      target: {
        name: 'tags',
        value: tags
      }
    });
  };

  const handleAddFaq = () => {
    if (newFaq.question.trim() === '' || newFaq.answer.trim() === '') {
      return; // Don't add empty FAQs
    }

    const updatedFaqs = [...faqs, { ...newFaq, id: Date.now() }];
    setFaqs(updatedFaqs);
    setNewFaq({ question: '', answer: '' });
    setShowFaqForm(false);

    // Update formData
    handleInputChange({
      target: {
        name: 'faqs',
        value: updatedFaqs
      }
    });
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setNewFaq({ question: faq.question, answer: faq.answer });
    setShowFaqForm(true);
  };

  const handleUpdateFaq = () => {
    if (newFaq.question.trim() === '' || newFaq.answer.trim() === '') {
      return; // Don't update with empty values
    }

    const updatedFaqs = faqs.map(faq =>
      faq.id === editingFaq.id ? { ...faq, question: newFaq.question, answer: newFaq.answer } : faq
    );

    setFaqs(updatedFaqs);
    setNewFaq({ question: '', answer: '' });
    setEditingFaq(null);
    setShowFaqForm(false);

    // Update formData
    handleInputChange({
      target: {
        name: 'faqs',
        value: updatedFaqs
      }
    });
  };

  const handleDeleteFaq = (faqId) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== faqId);
    setFaqs(updatedFaqs);

    // Update formData
    handleInputChange({
      target: {
        name: 'faqs',
        value: updatedFaqs
      }
    });
  };

  const handleCancelFaqForm = () => {
    setNewFaq({ question: '', answer: '' });
    setEditingFaq(null);
    setShowFaqForm(false);
  };

  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Additional information</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-semibold">Upload FAQs</h5>
          {!showFaqForm && (
            <button
              onClick={() => setShowFaqForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <PlusCircle size={18} />
              Add Question
            </button>
          )}
        </div>

        {showFaqForm && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter FAQ question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Enter FAQ answer"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelFaqForm}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFaq ? handleUpdateFaq : handleAddFaq}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  {editingFaq ? 'Update' : 'Add'} FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {faqs.length === 0 && !showFaqForm && (
            <p className="text-gray-500 text-center py-4">No FAQs added yet. Click "Add Question" to add your first FAQ.</p>
          )}

          {faqs.map(faq => (
            <div key={faq.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h6 className="font-semibold">{faq.question}</h6>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditFaq(faq)}
                    className="p-2 bg-green-50 dark:bg-green-900 text-green-600 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-2 bg-red-50 dark:bg-red-900 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h5 className="text-xl font-semibold mb-4">Tags</h5>
        <input
          type="text"
          name="tags"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          placeholder="Enter tags (comma-separated, e.g., programming, web development)"
          value={tagsInput}
          onChange={handleTagsChange}
        />
        <p className="mt-1 text-sm text-gray-500">Enter tags separated by commas</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="agreeToTerms"
            className="mt-1"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Any images, sounds, or other assets that are not my own work, have been appropriately licensed for use in the file preview or main course. Other than these items, this work is entirely my own and I have full rights to sell it here.
          </span>
        </label>
      </div>
    </div>
  );
};

export default AdditionalInfo;