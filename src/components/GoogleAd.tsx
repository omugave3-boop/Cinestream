import React from 'react';

interface GoogleAdProps {
  type: 'leaderboard' | 'sidebar' | 'banner';
}

const dimensions: Record<string, { width: number; height: number; label: string }> = {
  leaderboard: { width: 728, height: 90, label: 'Leaderboard Ad — 728×90' },
  sidebar: { width: 300, height: 250, label: 'Sidebar Ad — 300×250' },
  banner: { width: 468, height: 60, label: 'Banner Ad — 468×60' },
};

const GoogleAd: React.FC<GoogleAdProps> = ({ type }) => {
  const d = dimensions[type];
  return (
    <div
      className="google-ad"
      style={{ maxWidth: d.width, height: d.height }}
    >
      <span className="ad-label">{d.label}</span>
      <span className="ad-sublabel">Google AdSense Placeholder</span>
    </div>
  );
};

export default GoogleAd;
