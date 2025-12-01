import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { BarChart3, Plus, X, Users } from 'lucide-react';

const PollManagement = () => {
  const [polls, setPolls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '']
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    const allPolls = db.polls.getAll();
    setPolls(allPolls.reverse());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    db.polls.create({
      question: formData.question,
      options: validOptions,
      responses: [],
      status: 'active',
      createdBy: 'admin'
    });

    setShowModal(false);
    setFormData({ question: '', options: ['', ''] });
    loadPolls();
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const closePoll = (pollId) => {
    if (confirm('Close this poll? Students will no longer be able to respond.')) {
      db.polls.update(pollId, { status: 'closed' });
      loadPolls();
    }
  };

  const calculateResults = (poll) => {
    const totalResponses = poll.responses?.length || 0;
    const results = {};

    poll.options.forEach(option => {
      const count = poll.responses?.filter(r => r.response === option).length || 0;
      results[option] = {
        count,
        percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
      };
    });

    return results;
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poll Management</h1>
            <p className="text-gray-600 mt-1">Create and manage polls for students</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Poll
          </button>
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.map(poll => {
            const results = calculateResults(poll);
            const totalResponses = poll.responses?.length || 0;

            return (
              <div key={poll.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-gray-900">{poll.question}</h3>
                      {poll.status === 'active' ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-800">Closed</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {totalResponses} responses
                    </p>
                  </div>
                  {poll.status === 'active' && (
                    <button
                      onClick={() => closePoll(poll.id)}
                      className="btn btn-secondary"
                    >
                      Close Poll
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const result = results[option];
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{option}</span>
                          <span className="text-sm text-gray-600">
                            {result.count} votes ({result.percentage}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary rounded-full h-3 transition-all duration-300"
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Created on {new Date(poll.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}

          {polls.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No polls created yet
            </div>
          )}
        </div>

        {/* Create Poll Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Poll</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ question: '', options: ['', ''] });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter your poll question..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          className="input flex-1"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="btn btn-secondary mt-2 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    Create Poll
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ question: '', options: ['', ''] });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ManagementLayout>
  );
};

export default PollManagement;
