import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'pink' | 'indigo' | 'orange';

interface ThemeContextType {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  getThemeClasses: () => {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    border: string;
    background: string;
    hover: string;
    text: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themeConfig = {
  blue: {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-100',
    accent: 'bg-blue-50',
    gradient: 'from-blue-600 to-blue-700',
    border: 'border-blue-200',
    background: 'from-blue-50 via-blue-100 to-blue-200',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600'
  },
  green: {
    primary: 'bg-green-600',
    secondary: 'bg-green-100',
    accent: 'bg-green-50',
    gradient: 'from-green-600 to-green-700',
    border: 'border-green-200',
    background: 'from-green-50 via-green-100 to-green-200',
    hover: 'hover:bg-green-700',
    text: 'text-green-600'
  },
  purple: {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-100',
    accent: 'bg-purple-50',
    gradient: 'from-purple-600 to-purple-700',
    border: 'border-purple-200',
    background: 'from-purple-50 via-purple-100 to-purple-200',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-600'
  },
  pink: {
    primary: 'bg-pink-600',
    secondary: 'bg-pink-100',
    accent: 'bg-pink-50',
    gradient: 'from-pink-600 to-pink-700',
    border: 'border-pink-200',
    background: 'from-pink-50 via-pink-100 to-pink-200',
    hover: 'hover:bg-pink-700',
    text: 'text-pink-600'
  },
  indigo: {
    primary: 'bg-indigo-600',
    secondary: 'bg-indigo-100',
    accent: 'bg-indigo-50',
    gradient: 'from-indigo-600 to-indigo-700',
    border: 'border-indigo-200',
    background: 'from-indigo-50 via-indigo-100 to-indigo-200',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600'
  },
  orange: {
    primary: 'bg-orange-600',
    secondary: 'bg-orange-100',
    accent: 'bg-orange-50',
    gradient: 'from-orange-600 to-orange-700',
    border: 'border-orange-200',
    background: 'from-orange-50 via-orange-100 to-orange-200',
    hover: 'hover:bg-orange-700',
    text: 'text-orange-600'
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [color, setColorState] = useState<ThemeColor>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('holdingTheme') as ThemeColor;
    if (savedTheme && themeConfig[savedTheme]) {
      setColorState(savedTheme);
    }
  }, []);

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
    localStorage.setItem('holdingTheme', newColor);
  };

  const getThemeClasses = () => themeConfig[color];

  return (
    <ThemeContext.Provider value={{ color, setColor, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
}; 