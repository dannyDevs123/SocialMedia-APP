import React, { useEffect, useState } from 'react';
import { resolveAvatarUrl } from '../../utils/avatar';

const SIZE_CLASSES = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-24 h-24 text-3xl',
  xl: 'w-[133px] h-[133px] text-5xl',
};

const Avatar = ({ src, name, size = 'sm', className = '', ring = true }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveAvatarUrl(src);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const ringClass = ring ? 'avatar-ring' : '';

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center font-bold shrink-0 ${ringClass} ${className}`}
        aria-label={name ? `${name}'s avatar` : 'Default avatar'}
      >
        {initial}
      </div>
    );
  }

  const isLocalPreview = resolvedSrc.startsWith('blob:') || resolvedSrc.startsWith('data:');

  return (
    <img
      src={resolvedSrc}
      alt={name ? `${name}'s avatar` : 'Avatar'}
      className={`${sizeClass} rounded-full object-cover shrink-0 ${ringClass} ${className}`}
      crossOrigin={isLocalPreview ? undefined : 'anonymous'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

export default Avatar;
