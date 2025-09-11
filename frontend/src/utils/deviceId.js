/**
 * Device ID management utilities
 * Based on ShelfScanner's approach: UUID + localStorage + cookies
 */

const DEVICE_ID_KEY = 'bookscanner_device_id';
const COOKIE_NAME = 'deviceId';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Get or create a device ID
 * @returns {string} Device ID (UUID v4)
 */
export function getOrCreateDeviceId() {
    // 1. Check localStorage first (primary storage)
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
        // 2. Check if we can get it from cookie (fallback)
        deviceId = getCookieValue(COOKIE_NAME);
    }
    
    if (!deviceId) {
        // 3. Generate new UUID v4
        deviceId = generateUUID();
        console.log('🆔 Generated new device ID:', deviceId.substring(0, 8) + '...');
    } else {
        console.log('🆔 Using existing device ID:', deviceId.substring(0, 8) + '...');
    }
    
    // 4. Always sync to both storage mechanisms
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    setDeviceIdCookie(deviceId);
    
    return deviceId;
}

/**
 * Generate a UUID v4
 * @returns {string} UUID v4 string
 */
function generateUUID() {
    // Check if crypto.randomUUID is available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Set device ID cookie
 * @param {string} deviceId - Device ID to store
 */
function setDeviceIdCookie(deviceId) {
    const cookieValue = `${COOKIE_NAME}=${deviceId}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Strict`;
    document.cookie = cookieValue;
}

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

/**
 * Clear device ID from all storage
 * Useful for testing or user-requested data deletion
 */
export function clearDeviceId() {
    console.log('🗑️  Clearing device ID from all storage');
    
    // Clear localStorage
    localStorage.removeItem(DEVICE_ID_KEY);
    
    // Clear cookie (set expiration to past)
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
}

/**
 * Check if device ID exists in storage
 * @returns {boolean} True if device ID exists
 */
export function hasDeviceId() {
    const localStorageId = localStorage.getItem(DEVICE_ID_KEY);
    const cookieId = getCookieValue(COOKIE_NAME);
    return !!(localStorageId || cookieId);
}

/**
 * Get current device ID without creating one
 * @returns {string|null} Current device ID or null
 */
export function getCurrentDeviceId() {
    return localStorage.getItem(DEVICE_ID_KEY) || getCookieValue(COOKIE_NAME);
}