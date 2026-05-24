import React from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md' }) => {
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  let sizeClass = 'w-8 h-8 text-xs';
  if (size === 'md') sizeClass = 'w-10 h-10 text-sm';
  if (size === 'lg') sizeClass = 'w-16 h-16 text-lg';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-border shadow`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-[#1E2130] text-text-primary border border-border flex items-center justify-center font-bold font-mono tracking-wider shadow`}>
      {getInitials(name)}
    </div>
  );
};
