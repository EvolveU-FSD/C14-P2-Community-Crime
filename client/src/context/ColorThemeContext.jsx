import React, { createContext, useContext } from 'react';

// Define the color theme object
const colorTheme = {
    // Neutral colors
    neutralChangeColor: '#9E9E9E',  // Gray for unchanged values

    // Positive change colors (decrease in crime)
    lightPositiveChangeColor: '#81C784',  // Light blue-green
    strongPositiveChangeColor: '#1E88E5',  // Deep blue
    
    // Negative change colors (increase in crime)
    lightNegativeChangeColor: '#FDD835',  // Yellow
    strongNegativeChangeColor: '#D32F2F',  // Deep red
    
    // Scale midpoint color
    middleTotalColor: '#FFEB3B',  // Yellow
    
    // Scale arrays for different modes
    getScaleColors: function() {
        return {
            totalScale: [this.strongPositiveChangeColor, this.middleTotalColor, this.strongNegativeChangeColor],
            increaseScale: [this.lightNegativeChangeColor, this.strongNegativeChangeColor],
            decreaseScale: [this.strongPositiveChangeColor, this.lightPositiveChangeColor]
        };
    },
    
    // Helper function to get color class based on value
    getChangeClass: function(value) {
        if (value === 0) return 'unchanged';
        return value > 0 ? 'increase' : 'decrease';
    }
};

const ColorThemeContext = createContext(colorTheme);

export const useColorTheme = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({ children }) => {
    return (
        <ColorThemeContext.Provider value={colorTheme}>
            {children}
        </ColorThemeContext.Provider>
    );
};