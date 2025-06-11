import React from 'react';

export default function Fingerprint() {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 11c0 3.76-3.4 8-3.4 8M12 11c0 5.3 3.4 8 3.4 8" />
        <path d="M8.6 11c0 2.98 1.7 6 1.7 6M15.4 11c0 2-1.7 6-1.7 6" />
        <path d="M12 11v0" />
        <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M7 14.3s.64.7 1.5.7c1.5 0 2.5-1 5-1 2 0 3.17 1 4.5 1 .5 0 1-.14 1-.5 0-.34-.5-.5-1.5-.5-1.5 0-2.3 1-5 1-2 0-3.17-1-4.5-1-.84 0-1 .3-1 .3" />
      </svg>
      <span className="mt-2 text-sm text-gray-600">Touch fingerprint sensor</span>
    </div>
  );
}