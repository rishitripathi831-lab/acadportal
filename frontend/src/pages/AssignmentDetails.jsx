import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Card from '../components/Card';
import API from '../services/api';
import '../styles/pages.css';

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  // Mock assignment data
  const [assignment] = useState({
    id: assignmentId || 1,
    title: 'Database Design Project',
    subject: 'Database Systems',
    description: 'Design a comprehensive relational database for a student management system.',
    deadline: '2025-01-10',
    faculty: 'Dr. Rishi Tripathi',
    totalSubmissions: 8,
    submissions: [
      { id: 1, student: 'Aman Kumar', date: '2024-12-20', grade: 85 },
      { id: 2, student: 'Riya Singh', date: '2024-12-21', grade: 90 },
    ],
  });

  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const runSimilarityCheck = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      // In production, this would call your backend
      // const response = await API.post('/similarity/assignment', { assignmentId: assignment.id });
      
      // Mock delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI response
      const mockResult = {
        similarity: 62,
        riskLevel: 'medium',
        explanation: 'Database schema shows 62% similarity to sample solutions. Consider reviewing query implementations.',
        flaggedSections: [
          'Query optimization approach',
          'Index design strategy'
        ],
      };
      
      setAiResults(mockResult);
    } catch (error) {
      console.error('AI check failed:', error);
      setAiError('Failed to run AI check. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#2563eb';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low':
        return <FaCheckCircle style={{ color: '#10b981' }} />;
      case 'medium':
        return <FaExclamationTriangle style={{ color: '#f59e0b' }} />;
      case 'high':
        return <FaTimesCircle style={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Assignment Details Header */}
      <Card>
        <div className="card-header">
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{assignment.title}</h1>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>
              by {assignment.faculty} • {assignment.subject}
            </p>
          </div>
        </div>
        <div className="card-content">
          <p><strong>Description:</strong> {assignment.description}</p>
          <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString()}</p>
          <p><strong>Total Submissions:</strong> {assignment.totalSubmissions}</p>
        </div>
      </Card>

      {/* AI Similarity Check Section */}
      <Card style={{ marginTop: '2rem', borderLeft: '4px solid #2563eb' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <h2 style={{ margin: 0 }}>AI Assignment Similarity Check</h2>
          </div>
        </div>

        {!aiResults ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Analyze submissions for potential plagiarism and similarity patterns.
            </p>
            <button
              onClick={runSimilarityCheck}
              disabled={aiLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: aiLoading ? '#d1d5db' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              {aiLoading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Running Check...
                </>
              ) : (
                '▶ Run AI Similarity Check'
              )}
            </button>
          </div>
        ) : (
          <div className="ai-results" style={{ padding: '2rem 0' }}>
            {/* Similarity Score */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Similarity Score</h3>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {aiResults.similarity}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${aiResults.similarity}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, #2563eb, #3b82f6)`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Risk Level Badge */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ marginBottom: '0.75rem', fontWeight: '500', color: '#333' }}>Risk Level</p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '9999px',
                backgroundColor: `${getRiskColor(aiResults.riskLevel)}20`,
                border: `2px solid ${getRiskColor(aiResults.riskLevel)}`,
              }}>
                {getRiskIcon(aiResults.riskLevel)}
                <span style={{ fontWeight: '600', color: getRiskColor(aiResults.riskLevel), textTransform: 'capitalize' }}>
                  {aiResults.riskLevel}
                </span>
              </div>
            </div>

            {/* AI Explanation */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ margin: '0 0 0.75rem 0', fontWeight: '500' }}>AI Analysis:</p>
              <p style={{ margin: '0', color: '#555' }}>{aiResults.explanation}</p>
            </div>

            {/* Flagged Sections */}
            {aiResults.flaggedSections && aiResults.flaggedSections.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ marginBottom: '0.75rem', fontWeight: '500', color: '#333' }}>Flagged Sections:</p>
                <ul style={{
                  listStyle: 'none',
                  padding: '0',
                  display: 'grid',
                  gap: '0.5rem',
                }}>
                  {aiResults.flaggedSections.map((section, idx) => (
                    <li key={idx} style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef3c7',
                      borderLeft: '4px solid #f59e0b',
                      borderRadius: '0.25rem',
                      color: '#92400e',
                    }}>
                      • {section}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={() => setAiResults(null)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#333',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              ↻ Run Another Check
            </button>
          </div>
        )}

        {aiError && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#991b1b',
            marginTop: '1rem',
          }}>
            {aiError}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          color: '#1e40af',
          fontSize: '0.875rem',
        }}>
          ℹ️ <strong>Important:</strong> AI results are advisory and based on pattern matching. Final decisions regarding academic integrity rest with faculty judgment and institutional policies.
        </div>
      </Card>

      {/* Submissions List */}
      <Card style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 style={{ margin: 0 }}>Submissions ({assignment.submissions.length})</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submission Date</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {assignment.submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.student}</td>
                  <td>{new Date(sub.date).toLocaleDateString()}</td>
                  <td><strong>{sub.grade}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
