/**
 * API utilities with device ID integration
 * Handles all communication with the Flask backend
 */

import { getOrCreateDeviceId } from './deviceId';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Create API request with device ID headers and cookies
 * @param {string} endpoint - API endpoint (e.g., '/analyze')
 * @param {Object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
async function apiRequest(endpoint, options = {}) {
    // Get device ID for header fallback
    const deviceId = getOrCreateDeviceId();
    
    // Default headers
    const defaultHeaders = {
        'X-Device-ID': deviceId,  // Fallback header
        ...options.headers
    };
    
    // Default options
    const defaultOptions = {
        credentials: 'include',  // Include cookies
        headers: defaultHeaders,
        ...options
    };
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ API Response: ${endpoint}`, data);
        return data;
        
    } catch (error) {
        console.error(`❌ API Error: ${endpoint}`, error);
        throw error;
    }
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
    return apiRequest('/health');
}

/**
 * Analyze bookshelf image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeBookshelf(imageBase64, preferences) {
    return apiRequest('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: imageBase64,
            preferences: preferences
        })
    });
}

/**
 * Process Goodreads CSV file
 * @param {File} file - Goodreads CSV file
 * @returns {Promise<Object>} Extracted preferences
 */
export async function processGoodreadsCSV(file) {
    const deviceId = getOrCreateDeviceId();
    
    const formData = new FormData();
    formData.append('goodreads_csv', file);
    
    return apiRequest('/process-goodreads', {
        method: 'POST',
        headers: {
            'X-Device-ID': deviceId
            // Don't set Content-Type for FormData - let browser set it
        },
        body: formData
    });
}

/**
 * Get user's analysis history
 * @returns {Promise<Object>} Analysis history
 */
export async function getUserHistory() {
    return apiRequest('/history');
}

/**
 * Convert image file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string (without data: prefix)
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:image/jpeg;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result
 */
export function validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
    }
    
    if (file.size > maxSize) {
        return { valid: false, error: 'Image file is too large. Please select a file under 10MB.' };
    }
    
    return { valid: true };
}

/**
 * Validate Goodreads CSV file
 * @param {File} file - CSV file to validate
 * @returns {Object} Validation result
 */
export function validateGoodreadsFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        return { valid: false, error: 'Please select a CSV file' };
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        return { valid: false, error: 'CSV file is too large. Please select a file under 50MB.' };
    }
    
    return { valid: true };
}