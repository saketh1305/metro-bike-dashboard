import React, { useState, useEffect } from 'react';
import './styles/landing.css';

const images = [
  require('../assets/gallery1.webp'),
  require('../assets/gallery2.jpg'),
  require('../assets/gallery3.webp'),
  require('../assets/gallery4.jpg'),
]; // Replace with your image paths

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="landscape-container">
        <img src={require('../assets/la_image.jpg')} alt="Los Angeles Landscape" className="landscape" />
      </div>
      <div className="landing">
        <h1>Welcome to Metro Bike Sharing Dashboard</h1>
      </div>
      <div className="content-container">
        {/* Left Image Gallery */}
        <div className="gallery-section">
          <img
            src={images[currentImageIndex]}
            alt={`Slide ${currentImageIndex}`}
            className="gallery-image"
          />
        </div>
        {/* Right Description */}
        <div className="description-section">
          <h2>Why Use This Dashboard?</h2>
          <p>
            This dashboard helps you analyze trends in metro bike-sharing data, including trip duration, popular routes,
            and peak usage times. Explore insights that can optimize bike-sharing operations and improve urban
            transportation planning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;