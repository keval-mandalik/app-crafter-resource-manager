import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4';
      case 'rectangular':
        return '';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-48';
      default:
        return 'h-4';
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...getStyle(),
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getStyle()}
    />
  );
};

export default SkeletonLoader;