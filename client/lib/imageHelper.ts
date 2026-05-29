/**
 * Image URL Helper Utility
 * 
 * Add this to your frontend utilities or create a new file:
 * Location: client/lib/imageHelper.ts
 * 
 * This helper resolves player/team image URLs correctly whether they're
 * stored on Cloudinary (production) or local disk (development)
 */

/**
 * Resolves image URL to the correct full path
 * @param imageUrl - The image URL from the database (can be null, relative path, or full URL)
 * @param fallbackImage - Default image to show if no image is provided
 * @returns Full image URL or fallback image
 */
export const getImageUrl = (
  imageUrl: string | null | undefined,
  fallbackImage: string = '/default-player.png'
): string => {
  // If no image provided, return fallback
  if (!imageUrl) {
    return fallbackImage;
  }

  // If it's already a full URL (Cloudinary or external), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path (local storage), prepend backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Ensure the imageUrl starts with /
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${backendUrl}${normalizedPath}`;
};

/**
 * Get player image with proper error handling
 * Use this in your PlayerCard components
 */
export const PlayerImage = ({ 
  imageUrl, 
  name, 
  className = "w-full h-48 object-cover",
  fallback = '/default-player.png'
}: { 
  imageUrl?: string | null; 
  name: string; 
  className?: string;
  fallback?: string;
}) => {
  const [imgSrc, setImgSrc] = React.useState(getImageUrl(imageUrl, fallback));
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(getImageUrl(imageUrl, fallback));
    setHasError(false);
  }, [imageUrl, fallback]);

  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load image for ${name}, using fallback`);
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={name}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

/**
 * Example Usage in Player Card Component:
 * 
 * import { getImageUrl, PlayerImage } from '@/lib/imageHelper';
 * 
 * // Method 1: Using helper function directly
 * <img 
 *   src={getImageUrl(player.imageUrl)} 
 *   alt={player.name}
 *   className="w-full h-48 object-cover"
 *   onError={(e) => {
 *     e.currentTarget.src = '/default-player.png';
 *   }}
 * />
 * 
 * // Method 2: Using PlayerImage component (recommended)
 * <PlayerImage 
 *   imageUrl={player.imageUrl} 
 *   name={player.name}
 *   className="w-full h-48 object-cover rounded-lg"
 *   fallback="/default-player.png"
 * />
 */

/**
 * Team Logo URL Helper
 */
export const getTeamLogoUrl = (
  logoUrl: string | null | undefined,
  fallbackLogo: string = '/default-team-logo.png'
): string => {
  return getImageUrl(logoUrl, fallbackLogo);
};

/**
 * Auction Banner URL Helper
 */
export const getBannerUrl = (
  bannerUrl: string | null | undefined,
  fallbackBanner: string = '/default-banner.png'
): string => {
  return getImageUrl(bannerUrl, fallbackBanner);
};

// React import for the PlayerImage component
import React from 'react';

export default {
  getImageUrl,
  PlayerImage,
  getTeamLogoUrl,
  getBannerUrl,
};
