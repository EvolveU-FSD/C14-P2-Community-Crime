import { useColorTheme } from "../context/ColorThemeContext";
import "../styles/CrimeColourLegend.css";

export default function CrimeColourLegend({ scale, maxValue, minValue, mode }) {
    const colorTheme = useColorTheme();
    
    // Legend configuration based on mode
    const legendConfig = mode === 'difference' 
        ? {
            title: "Crime Change",
            labels: [
                { value: minValue, label: `${minValue}`, className: "decrease" },
                { value: 0, label: "No change", className: "unchanged" },
                { value: maxValue, label: `+${maxValue}`, className: "increase" }
            ]
        }
        : {
            title: "Crime Count",
            labels: [
                { value: 0, label: "0", className: "low" },
                { value: Math.round(maxValue / 2), label: `${Math.round(maxValue / 2)}`, className: "mid" },
                { value: maxValue, label: `${maxValue}`, className: "high" }
            ]
        };
    
    // Generate color stops for the gradient
    const getGradientStops = () => {
        if (mode === 'difference') {
            // For difference mode, use both increase and decrease scales
            return `
                ${colorTheme.strongPositiveChangeColor} 0%,
                ${colorTheme.lightPositiveChangeColor} 40%,
                ${colorTheme.neutralChangeColor} 50%,
                ${colorTheme.lightNegativeChangeColor} 60%,
                ${colorTheme.strongNegativeChangeColor} 100%
            `;
        } else {
            // For total mode, use the total scale
            return `
                ${colorTheme.strongPositiveChangeColor} 0%,
                ${colorTheme.middleTotalColor} 50%,
                ${colorTheme.strongNegativeChangeColor} 100%
            `;
        }
    };
    
    // Calculate the position of each label as a percentage
    const calculatePosition = (value) => {
        if (mode === 'difference') {
            return `${((value - minValue) / (maxValue - minValue)) * 100}%`;
        } else {
            return `${(value / maxValue) * 100}%`;
        }
    };
    
    return (
        <div className="crime-colour-legend">
            <h4>{legendConfig.title}</h4>
            <div 
                className="legend-gradient"
                style={{background: `linear-gradient(to right, ${getGradientStops()})`}}
            >
                {legendConfig.labels.map((item, index) => (
                    <div 
                        key={index} 
                        className={`legend-label ${item.className}`} 
                        style={{
                            left: calculatePosition(item.value)
                        }}
                    >
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}