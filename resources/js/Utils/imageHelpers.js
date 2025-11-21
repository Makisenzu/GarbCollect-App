/**
 * Get the appropriate URL for a user's profile picture
 * Handles Google OAuth pictures, local uploads, and default avatars
 * 
 * @param {string|null} picture - The picture field from user object
 * @returns {string} The URL to display
 */
export const getUserPictureUrl = (picture) => {
    if (!picture) {
        return '/default-avatar.svg';
    }
    
    // If picture starts with http, it's a Google profile picture URL
    if (picture.startsWith('http://') || picture.startsWith('https://')) {
        return picture;
    }
    
    // Otherwise, it's a local file
    return `/storage/profile-pictures/${picture}`;
};

/**
 * Component helper for displaying user avatars
 * Use this in JSX components for consistent picture display
 * 
 * @param {object} user - User object with picture property
 * @returns {string} The URL to display
 */
export const getAvatarUrl = (user) => {
    return getUserPictureUrl(user?.picture);
};
