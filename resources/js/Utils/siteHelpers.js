/**
 * Get the display name for a site (purok name or fallback to site name)
 * @param {Object} site - The site object
 * @returns {string} - The display name
 */
export const getSiteDisplayName = (site) => {
    if (!site) return 'Site';
    
    // Try display_name from backend first (if model accessor is working)
    if (site.display_name) {
        return site.display_name;
    }
    
    // Try purok name
    if (site.purok?.purok_name) {
        return site.purok.purok_name;
    }
    
    // Fallback to site_name if exists
    if (site.site_name) {
        return site.site_name;
    }
    
    // Final fallback
    return 'Site';
};

/**
 * Get initial letter for avatar/marker fallback
 * @param {Object} site - The site object
 * @returns {string} - The first letter
 */
export const getSiteInitial = (site) => {
    const displayName = getSiteDisplayName(site);
    return displayName.charAt(0).toUpperCase();
};
