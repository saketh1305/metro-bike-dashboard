import React, { useState } from 'react';
import './routeStatsTooltip.css';

const RouteStatsTooltip = ({ route, x, y, onExpand, onOverlaySelect }) => {
  const [expanded, setExpanded] = useState(false);

  if (!route) return null;

  return (
    <div
      className="route-stats-tooltip"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        zIndex: 1000,
        width: expanded ? '300px' : '200px',
      }}
    >
      <h4>Route Stats</h4>
      <p><strong>Type:</strong> {route.type === 'recommended' ? 'Recommended' : 'Fastest'}</p>
      <p><strong>Distance:</strong> {route.distance}</p>
      <p><strong>ETA:</strong> {route.eta}</p>
      <p><strong>Calories:</strong> 300 kcal - 400 kcal</p>
      {/* Static Traffic Line Representation */}
      <div>
        <strong>Traffic:</strong>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
          <div
            style={{
              height: '10px',
              width: '20%', // This represents a third of the route
              backgroundColor: 'green',  // Low traffic
              margin: '0 2px',
            }}
          ></div>
          <div
            style={{
              height: '10px',
              width: '40%', // This represents another third of the route
              backgroundColor: 'orange',  // Medium traffic
              margin: '0 2px',
            }}
          ></div>
          <div
            style={{
              height: '10px',
              width: '10%', // Remaining portion for high traffic
              backgroundColor: 'green',  // High traffic
              margin: '0 2px',
            }}
          ></div>
          <div
            style={{
              height: '10px',
              width: '10%', // Remaining portion for high traffic
              backgroundColor: 'red',  // High traffic
              margin: '0 2px',
            }}
          ></div>
          <div
            style={{
              height: '10px',
              width: '20%', // Remaining portion for high traffic
              backgroundColor: 'green',  // High traffic
              margin: '0 2px',
            }}
          ></div>
        </div>
      </div>

      {!expanded && (
        <button
          onClick={() => {
            setExpanded(true);
            onExpand(route); // Trigger map magnification
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Expand"
        >
          ➕
        </button>
      )}

      {expanded && (
        <div>
          <h5>Select Overlay:</h5>
          <select
            onChange={(e) => onOverlaySelect(e.target.value)}
            style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
          >
            <option value="">None</option>
            <option value="pollution">Pollution Heatmap</option>
            <option value="crime">Crime Heatmap</option>
            <option value="elevation">Elevation Chart</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default RouteStatsTooltip;
