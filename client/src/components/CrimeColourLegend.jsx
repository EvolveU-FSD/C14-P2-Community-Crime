import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../style/CrimeColourLegend.css';

export default function CrimeColourLegend({ scale, maxValue, minValue = 0, mode = 'total' }) {
  const [legendSteps, setLegendSteps] = useState([]);
  
  useEffect(() => {
    if (!scale) return;
    
    const steps = [];
    const stepCount = 5;
    
    if (mode === 'difference') {
      // For difference mode, create a diverging scale
      const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
      
      // Handle the case where there's no difference
      if (absMax === 0) {
        steps.push({
          value: 0,
          label: "No change",
          color: scale(0).hex()
        });
      } else {
        // Create steps for decrease (negative values)
        if (minValue < 0) {
          const decreaseSteps = Math.floor(stepCount / 2);
          for (let i = decreaseSteps; i > 0; i--) {
            const value = -1 * Math.round((absMax * i) / decreaseSteps);
            steps.push({
              value,
              label: value.toString(),
              color: scale(value).hex()
            });
          }
        }
        
        // Add zero point
        steps.push({
          value: 0,
          label: "0",
          color: scale(0).hex()
        });
        
        // Create steps for increase (positive values)
        if (maxValue > 0) {
          const increaseSteps = Math.floor(stepCount / 2);
          for (let i = 1; i <= increaseSteps; i++) {
            const value = Math.round((maxValue * i) / increaseSteps);
            steps.push({
              value,
              label: "+" + value.toString(),
              color: scale(value).hex()
            });
          }
        }
      }
    } else {
      // Regular total mode - linear scale
      for (let i = 0; i <= stepCount; i++) {
        const value = Math.round((maxValue * i) / stepCount);
        steps.push({
          value,
          label: value.toString(),
          color: scale(value).hex()
        });
      }
    }
    
    setLegendSteps(steps);
  }, [scale, maxValue, minValue, mode]);

  if (legendSteps.length === 0) return null;

  // Create portal to render outside the map container
  return createPortal(
    <div className="crime-color-legend">
      <h3>{mode === 'total' ? 'Crime Count' : 'Crime Change'}</h3>
      <div className="legend-container">
        <div className="legend-gradient" 
          style={{ 
            background: `linear-gradient(to right, ${legendSteps.map(step => step.color).join(', ')})`
          }} 
        />
        <div className="legend-labels">
          {legendSteps.map((step, index) => (
            <div key={index} className="legend-label">{step.label}</div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}