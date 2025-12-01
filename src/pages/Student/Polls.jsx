import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { BarChart3, Check } from 'lucide-react';

const Polls = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    loadPolls();
  }, [user]);

  const loadPolls = () => {
    const allPolls = db.polls.getAll();
    setPolls(allPolls.reverse());
  };

  const hasVoted = (poll) => {
    return poll.responses?.some(r => r.studentId === user.id);
  };

  const handleVote = (pollId, option) => {
    if (confirm(`Vote for "${option}"?`)) {
      db.polls.addResponse(pollId, user.id, option);
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

  const getMyVote = (poll) => {
    const myResponse = poll.responses?.find(r => r.studentId === user.id);
    return myResponse?.response;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Polls</h1>
          <p className="text-gray-600 mt-1">Participate in hostel polls</p>
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.map(poll => {
            const voted = hasVoted(poll);
            const results = calculateResults(poll);
            const myVote = getMyVote(poll);
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
                    <p className="text-sm text-gray-600">
                      {totalResponses} response{totalResponses !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const result = results[option];
                    const isMyVote = myVote === option;

                    return (
                      <div key={index}>
                        {!voted && poll.status === 'active' ? (
                          <button
                            onClick={() => handleVote(poll.id, option)}
                            className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border-2 border-transparent hover:border-primary"
                          >
                            <span className="font-medium text-gray-900">{option}</span>
                          </button>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{option}</span>
                                {isMyVote && (
                                  <span className="badge badge-success flex items-center text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Your vote
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {result.count} ({result.percentage}%)
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-3">
                              <div
                                className={`${isMyVote ? 'bg-green-500' : 'bg-primary'} rounded-full h-3 transition-all duration-300`}
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {voted && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ You have voted in this poll
                    </p>
                  </div>
                )}

                {poll.status === 'closed' && !voted && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      This poll is closed
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  Created on {new Date(poll.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}

          {polls.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No polls available
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Polls;
