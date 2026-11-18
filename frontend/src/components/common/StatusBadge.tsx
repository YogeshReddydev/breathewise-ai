import React from 'react';
import { HealthCategory } from '../../types/aqi';
import { getAQIColorHex, getAQILabel } from '../../utils/aqiCalculator';

interface StatusBadgeProps {
  category: HealthCategory;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  category,
  size = 'md',
  showDot = true,
}) => {
  const color = getAQIColorHex(
    category === 'good' ? 40 :
    category === 'moderate' ? 80 :
    category === 'sensitive' ? 130 :
    category === 'unhealthy' ? 180 :
    category === 'very_unhealthy' ? 250 : 350
  );
  const label = getAQILabel(category);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  );
};
