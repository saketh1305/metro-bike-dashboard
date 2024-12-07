import React from 'react';
import { Line } from 'react-chartjs-2';
import './ElevationProfile.css'; // Your existing CSS file

const ElevationChart = ({ data, onClose }) => {
  // Hardcoded elevation data
  const elevationData = [
    { distance: 0, elevation: 100 },
    { distance: 1, elevation: 150 },
    { distance: 2, elevation: 200 },
    { distance: 3, elevation: 250 },
    { distance: 4, elevation: 300 },
    { distance: 5, elevation: 280 },
    { distance: 6, elevation: 350 },
    { distance: 7, elevation: 400 },
    { distance: 8, elevation: 420 },
    { distance: 9, elevation: 390 },
    { distance: 10, elevation: 450 },
  ];

  // Chart.js data and options
  const chartData = {
    labels: elevationData.map((point) => `${point.distance} km`),
    datasets: [
      {
        label: 'Elevation (m)',
        data: elevationData.map((point) => point.elevation),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderWidth: 2,
        stepped: true, // Step-like behavior
        tension: 0, // Straight lines
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distance (km)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Elevation (m)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="elevation-chart-card">
      <div>
        <button className="close-chart-button" onClick={onClose}>
          Close
        </button>
      </div>
      <h3 className="elevation-card-title">Elevation Profile</h3>
      <div style={{ height: '200px', width: '100%' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ElevationChart;
