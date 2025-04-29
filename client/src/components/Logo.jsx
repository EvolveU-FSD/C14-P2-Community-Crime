import '../styles/Logo.css';
import { useState, useEffect } from 'react';

export default function Logo() {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Check initial screen size
    checkScreenSize();
    
    // Set up listener for screen size changes
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth <= 480);
    // Reset expanded state when resizing
    if (window.innerWidth > 480) {
      setIsExpanded(false);
    }
  };
  
  const toggleExpand = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div 
      className={`app-logo ${isMobile ? 'mobile' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpand}
    >
      <img 
        src={isMobile && !isExpanded ? "/CrimeAndPlace-Icon.png" : "/CrimeAndPlace-Logo.png"} 
        alt="Crime and Place Logo" 
        className="logo-image"
      />
    </div>
  );
}