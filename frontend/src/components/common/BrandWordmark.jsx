import React from 'react';

export const BRAND_BLUE = '#1d9bf0';

const BrandWordmark = ({
  as: Component = 'span',
  className = '',
  style,
  children = 'ZiZU',
  ...props
}) => {
  return (
    <Component
      className={`inline-block font-extrabold tracking-tight leading-none select-none ${className}`}
      style={{ color: BRAND_BLUE, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default BrandWordmark;
