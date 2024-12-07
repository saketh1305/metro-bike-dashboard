import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './StationInfoPanel.css';

// Register required components
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const StationInfoPanel = ({ station, usageData, onClose }) => {
  const dailyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  // Debugging usageData
  useEffect(() => {
    console.log('Station:', station);
    console.log('Usage Data:', usageData);
  }, [station, usageData]);

  useEffect(() => {
    return () => {
      if (dailyChartRef.current) {
        dailyChartRef.current.destroy();
      }
      if (monthlyChartRef.current) {
        monthlyChartRef.current.destroy();
      }
    };
  }, []);

  if (!station || !usageData) return null;

  // Default data for testing
  const defaultDailyData = {
    hours: ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM'],
    usage: [10, 20, 15, 30, 25],
  };

  const defaultMonthlyData = {
    days: ['01 Nov', '02 Nov', '03 Nov', '04 Nov', '05 Nov'],
    usage: [100, 200, 150, 300, 250],
  };

  const dailyChartData = {
    labels: usageData.daily?.hours || defaultDailyData.hours,
    datasets: [
      {
        label: 'Hourly Usage',
        data: usageData.daily?.usage || defaultDailyData.usage,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const monthlyChartData = {
    labels: usageData.monthly?.days || defaultMonthlyData.days,
    datasets: [
      {
        label: 'Daily Usage',
        data: usageData.monthly?.usage || defaultMonthlyData.usage,
        backgroundColor: 'rgba(153,102,255,0.6)',
        borderColor: 'rgba(153,102,255,1)',
      },
    ],
  };

  return (
    <div className="station-info-panel">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h3>{station.name}</h3>
      {/* <p><strong>Location:</strong> {`${station.latitude}, ${station.longitude}`}</p> */}
      <p><strong>Bikes Available:</strong> {station.bikes_available}</p>
      <p><strong>Total Docks:</strong> {station.total_docks}</p>
      <p><strong>AQI:</strong> {station.aqi}</p>
      <p><strong>Nearby Amenities:</strong> {station.nearby_amenities} POIs</p>

      <div className="charts">
        <h4>Daily Usage</h4>
        <Line data={dailyChartData} ref={(chart) => (dailyChartRef.current = chart?.chart)} />
        <h4>Monthly Trends</h4>
        <Bar data={monthlyChartData} ref={(chart) => (monthlyChartRef.current = chart?.chart)} />
      </div>
    </div>
  );
};

export default StationInfoPanel;



