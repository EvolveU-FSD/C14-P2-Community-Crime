import React, { useState, useEffect } from 'react';
import CommunityFilterMultiSelect from './CommunityFilterMultiSelect';
import CrimeFilterMultiSelect from './CrimeFilterMultiSelect';
import DateRangeFilter from './DateRangeFilter';
import '../styles/FilterPanel.css';

export default function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    // Initial check
    checkWindowSize();
    
    // Add event listener
    window.addEventListener('resize', checkWindowSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileView) return;
    
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.filter-panel') && 
          !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isMobileView]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // For desktop view
  if (!isMobileView) {
    return (
      <div className={`filter-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="filter-header">
          <h2>Filters</h2>
          <button 
            className="toggle-button" 
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="filter-content">
            <div className="filter-section">
              <h3>Communities</h3>
              <CommunityFilterMultiSelect />
            </div>
            
            <div className="filter-section">
              <h3>Crime Types</h3>
              <CrimeFilterMultiSelect />
            </div>
            
            <div className="filter-section">
              <h3>Date Range</h3>
              <DateRangeFilter />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For mobile view
  return (
    <>
      <button 
        className="mobile-menu-button" 
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {isMobileMenuOpen && (
        <div className="mobile-filter-panel">
          <div className="filter-header mobile">
            <h2>Filters</h2>
            <button 
              className="close-button" 
              onClick={toggleMobileMenu}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
          
          <div className="filter-content mobile">
            <div className="filter-section">
              <h3>Communities</h3>
              <CommunityFilterMultiSelect />
            </div>
            
            <div className="filter-section">
              <h3>Crime Types</h3>
              <CrimeFilterMultiSelect />
            </div>
            
            <div className="filter-section">
              <h3>Date Range</h3>
              <DateRangeFilter />
            </div>
          </div>
        </div>
      )}
    </>
  );
}