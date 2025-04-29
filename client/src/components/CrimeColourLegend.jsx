import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../style/CrimeColourLegend.css';

export default function CrimeColourLegend({ scale, maxValue, minValue = 0, mode = 'total' }) {
  const [legendSteps, setLegendSteps] = useState([]);
  
  useEffect(() => {
    if (!scale) return;
    
    const steps = [];
    const stepCount = 5; // Total number of steps
    
    if (mode === 'difference') {
      // For difference mode, create a symmetrical diverging scale
      const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
      
      // Handle the case where there's no difference
      if (absMax === 0) {
        steps.push({
          value: 0,
          label: "No change",
          color: scale(0).hex()
        });
      } else {
        // Create an even number of steps on both sides
        const stepsPerSide = Math.floor(stepCount / 2);
        
        // Negative steps (decreases) - Use green
        for (let i = stepsPerSide; i > 0; i--) {
          const value = -absMax * i / stepsPerSide;
          steps.push({
            value,
            label: Math.round(value).toString(),
            color: scale(value).hex()
          });
        }
        
        // Add zero point - Use blue
        steps.push({
          value: 0,
          label: "0",
          color: scale(0).hex()
        });
        
        // Positive steps (increases) - Use red
        for (let i = 1; i <= stepsPerSide; i++) {
          const value = absMax * i / stepsPerSide;
          steps.push({
            value,
            label: "+" + Math.round(value).toString(),
            color: scale(value).hex()
          });
        }
      }
    } else {
      // Regular total mode - linear scale (green to red)
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