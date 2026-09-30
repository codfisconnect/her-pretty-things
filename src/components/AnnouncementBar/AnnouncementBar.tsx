import React from 'react';
import { Sparkles } from 'lucide-react';
import './AnnouncementBar.css';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside className="announcement-bar" aria-label="Announcement">
      <Sparkles size={12} className="announcement-highlight" aria-hidden="true" />
      <span>
        Complimentary Luxury Gift Box &amp; Free Express Delivery on Orders Above{' '}
        <span className="announcement-highlight">₹999</span>
      </span>
      <Sparkles size={12} className="announcement-highlight" aria-hidden="true" />
    </aside>
  );
};
