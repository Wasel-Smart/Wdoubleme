import { memo } from 'react';
import type { Profile } from '../../types';

interface UserAvatarProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  className?: string;
}

export const UserAvatar = memo<UserAvatarProps>(({ 
  profile, 
  size = 'md', 
  showRating = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const getInitials = () => {
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          className={`${sizeClasses[size]} rounded-full object-cover wasel-circle`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary wasel-circle`}>
          {getInitials()}
        </div>
      )}
      
      {showRating && profile.rating_as_driver > 0 && (
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 text-xs font-semibold border border-gray-200 dark:border-gray-700">
          ⭐ {profile.rating_as_driver.toFixed(1)}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom equality check for better performance
  return (
    prevProps.profile.id === nextProps.profile.id &&
    prevProps.profile.avatar_url === nextProps.profile.avatar_url &&
    prevProps.profile.full_name === nextProps.profile.full_name &&
    prevProps.profile.rating_as_driver === nextProps.profile.rating_as_driver &&
    prevProps.size === nextProps.size &&
    prevProps.showRating === nextProps.showRating &&
    prevProps.className === nextProps.className
  );
});

UserAvatar.displayName = 'UserAvatar';