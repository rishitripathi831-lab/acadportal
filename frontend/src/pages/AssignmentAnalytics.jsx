import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Card from '../components/Card';
import '../styles/pages.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AssignmentAnalytics = () => {
  const pieChartData = {
    labels: ['Submitted', 'Not Submitted'],
    datasets: [
      {
        data: [25, 15],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 2,
      },
    ],
  };

  const students = [
    { id: 'STU001', name: 'Rishi', status: 'Submitted' },
    { id: 'STU002', name: 'Aman', status: 'Not Submitted' },
    { id: 'STU003', name: 'Riya', status: 'Submitted' },
    { id: 'STU004', name: 'Sagar', status: 'Submitted' },
    { id: 'STU05', name: 'Anjali', status: 'Not Submitted' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card title="Submission Status">
          <Pie data={pieChartData} />
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title="Student Submissions">
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentAnalytics;
