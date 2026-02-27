import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/pages.css';

const StudentMarksAnalytics = () => {
  const navigate = useNavigate();
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching marks for user:', user.id);
      const response = await fetch(`http://localhost:5000/api/marks/student/${user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Marks API response:', data);

      // Normalize response into { results: Array }
      let resultsArray = [];
      if (Array.isArray(data)) {
        resultsArray = data;
      } else if (data && Array.isArray(data.data)) {
        resultsArray = data.data;
      } else if (data && Array.isArray(data.results)) {
        resultsArray = data.results;
      } else if (data && Array.isArray(data.value)) {
        // some wrappers may use `value`
        resultsArray = data.value;
      }

      setMarks({ results: resultsArray });
    } catch (err) {
      console.error('Error fetching marks:', err);
      setError(err.message || 'Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!marks || !marks.results || marks.results.length === 0) return [];

    return marks.results.map((item) => {
      // Support both legacy and current DB column names
      const rawMid1 = item.mid1_marks ?? item.mid_term_1 ?? null;
      const rawMid2 = item.mid2_marks ?? item.mid_term_2 ?? null;

      const mid1 = rawMid1 === null || rawMid1 === undefined ? null : Number(rawMid1);
      const mid2 = rawMid2 === null || rawMid2 === undefined ? null : Number(rawMid2);

      return {
        name: item.subject || 'Unknown',
        subject: item.subject || 'Unknown',
        mid1,
        mid2,
      };
    });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const chartData = prepareChartData();

  return (
    <div className="page-container">
      <button
        onClick={() => navigate('/student-dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          marginBottom: '2rem',
          backgroundColor: '#e5e7eb',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2rem', fontWeight: 'bold' }}>
        Marks & Analytics
      </h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Loading marks...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          Error: {error}
        </div>
      )}

      {!loading && !marks?.results?.length && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            color: '#666',
          }}
        >
          <p style={{ fontSize: '1.1rem', margin: '0' }}>No marks available yet</p>
          <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', color: '#999' }}>
            Your marks will appear once faculty evaluates your assignments
          </p>
        </div>
      )}

      {!loading && marks?.results?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Mid Term 1 Chart */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', fontWeight: '600' }}>
              Mid Term 1 Marks
            </h3>
            {chartData.some((d) => d.mid1 !== null) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.filter((d) => d.mid1 !== null)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, mid1 }) => `${name}: ${mid1}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="mid1"
                  >
                    {chartData
                      .filter((d) => d.mid1 !== null)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} marks`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                Not Evaluated
              </div>
            )}
          </div>

          {/* Mid Term 2 Chart */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', fontWeight: '600' }}>
              Mid Term 2 Marks
            </h3>
            {chartData.some((d) => d.mid2 !== null) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.filter((d) => d.mid2 !== null)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, mid2 }) => `${name}: ${mid2}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="mid2"
                  >
                    {chartData
                      .filter((d) => d.mid2 !== null)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} marks`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                Not Evaluated
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && marks?.results?.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflowX: 'auto',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1f2937', fontWeight: '600' }}>
            Subject-wise Marks Summary
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Subject
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>
                  Mid Term 1
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>
                  Mid Term 2
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>
                  Average
                </th>
              </tr>
            </thead>
            <tbody>
              {marks.results.map((item, index) => {
                const rawMid1 = item.mid1_marks ?? item.mid_term_1 ?? null;
                const rawMid2 = item.mid2_marks ?? item.mid_term_2 ?? null;
                const mid1 = rawMid1 === null || rawMid1 === undefined ? null : Number(rawMid1);
                const mid2 = rawMid2 === null || rawMid2 === undefined ? null : Number(rawMid2);

                const sum = (mid1 ?? 0) + (mid2 ?? 0);
                const count = (mid1 !== null ? 1 : 0) + (mid2 !== null ? 1 : 0);
                const avg = count > 0 ? (sum / count).toFixed(1) : null;

                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#374151' }}>{item.subject || '—'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#374151' }}>
                      {mid1 !== null ? mid1 : 'Not Evaluated'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#374151' }}>
                      {mid2 !== null ? mid2 : 'Not Evaluated'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#374151', fontWeight: '600' }}>
                      {avg !== null ? avg : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentMarksAnalytics;
