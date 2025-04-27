import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../style/CrimeColourLegend.css';

export default function CrimeColourLegend({ scale, maxCrime }) {
  const [legendSteps, setLegendSteps] = useState([]);
  
  useEffect(() => {
    if (maxCrime && scale) {
      // Create steps for the legend
      const steps = [];
      const stepCount = 5;
      
      for (let i = 0; i <= stepCount; i++) {
        const value = Math.round((maxCrime * i) / stepCount);
        steps.push({
          value,
          color: scale(value).hex()
        });
      }
      
      setLegendSteps(steps);
    }
  }, [scale, maxCrime]);

  if (!maxCrime || legendSteps.length === 0) return null;

  // Create portal to render outside the map container
  return createPortal(
    <div className="crime-color-legend">
      <h3>Crime Count</h3>
      <div className="legend-container">
        <div className="legend-gradient" 
          style={{ 
            background: `linear-gradient(to right, ${legendSteps.map(step => step.color).join(', ')})` 
          }} 
        />
        <div className="legend-labels">
          {legendSteps.map((step, index) => (
            <div key={index} className="legend-label">{step.value}</div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}