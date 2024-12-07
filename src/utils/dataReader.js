import Papa from 'papaparse';

// Function to fetch and parse the CSV file
export const fetchBikeStations = async () => {
  return new Promise((resolve, reject) => {
    const csvPath = '/data/bike_stations.csv'; // Relative path in the public folder

    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        resolve(results.data); // Parsed data
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};



export const fetchDailyUsage = async (stationId) => {
  return new Promise((resolve, reject) => {
    const csvPath = '/data/daily_usage.csv'; // Path to the daily usage dataset
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const filteredData = results.data.filter(
          (record) => record.station_id === String(stationId)
        );
        resolve({
          hours: filteredData.map((record) => record.hour || ''), // Safeguard against missing values
          usage: filteredData.map((record) => parseInt(record.usage || 0, 10)), // Ensure numeric values
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};


export const fetchMonthlyUsage = async (stationId) => {
  return new Promise((resolve, reject) => {
    const csvPath = '/data/monthly_usage.csv'; // Path to the monthly usage dataset
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const filteredData = results.data.filter(
          (record) => record.station_id === String(stationId)
        );
        resolve({
          days: filteredData.map((record) => record.day || ''), // Safeguard against missing values
          usage: filteredData.map((record) => parseInt(record.usage || 0, 10)), // Ensure numeric values
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
