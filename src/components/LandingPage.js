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
          <h2>Tailoring bike routes for today's urban rider</h2>
          <p>
          Our dashboard designs routes that address the real challenges of urban biking, 
          ensuring each journey is informed, safe, and tailored to the complexities of city 
          travel. This user-focused tool goes beyond business analytics to enhance every cyclist's 
          experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;