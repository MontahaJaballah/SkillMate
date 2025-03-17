import React, { useState } from "react";
import PropTypes from "prop-types";

// Notification Component
export const Notification = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg p-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
            {message}
        </div>
    );
};

export const CardBlock = ({ isOpen, onClose, onConfirm }) => {
    const [selectedReason, setSelectedReason] = useState('');

    const reasons = [
        'Inappropriate content',
        'Spam or scams',
        'Harassment',
        'Fake account',
        'Other'
    ];

    const handleConfirm = () => {
        if (selectedReason) {
            onConfirm(selectedReason);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Select Block Reason</h2>
                <div className="mb-6">
                    <p className="text-gray-600 mb-4">Please choose a reason for blocking:</p>
                    <div className="space-y-3">
                        {reasons.map(reason => (
                            <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="block-reason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="form-radio text-primary focus:ring-primary"
                                />
                                <span className="text-gray-700">{reason}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedReason}
                        className={`px-4 py-2 rounded-lg font-medium ${selectedReason
                            ? 'bg-secondary text-white hover:bg-secondary-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Confirm Block
                    </button>
                </div>
            </div>
        </div>
    );
};

CardBlock.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

Notification.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    onClose: PropTypes.func.isRequired
};
