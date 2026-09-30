import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound: React.FC = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-code">404</div>
      <h1 className="notfound-title">Page Not Found</h1>
      <p className="notfound-text">
        The hijab collection or page you were looking for does not exist or has been moved.
        Allow us to guide you back to our luxury atelier.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="hero-primary-btn">
          Return to Atelier Home
        </Link>
        <Link to="/shop" className="hero-secondary-btn">
          Browse All Hijabs
        </Link>
      </div>
    </div>
  );
};
