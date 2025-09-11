/**
 * Device Context - Manages device ID across the React app
 * Provides device ID to all components that need it
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getOrCreateDeviceId, clearDeviceId, getCurrentDeviceId } from '../utils/deviceId';

// Create the context
const DeviceContext = createContext();

/**
 * Device Provider Component
 * Wrap your app with this to provide device ID to all components
 */
export function DeviceProvider({ children }) {
    const [deviceId, setDeviceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeDeviceId();
    }, []);

    /**
     * Initialize device ID on app startup
     */
    const initializeDeviceId = async () => {
        try {
            console.log('🚀 Initializing device ID...');
            setLoading(true);
            setError(null);

            // Get or create device ID
            const id = getOrCreateDeviceId();
            setDeviceId(id);
            
            console.log('✅ Device ID initialized successfully');
        } catch (err) {
            console.error('❌ Failed to initialize device ID:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Refresh device ID (useful for testing or recovery)
     */
    const refreshDeviceId = () => {
        console.log('🔄 Refreshing device ID...');
        const id = getOrCreateDeviceId();
        setDeviceId(id);
        return id;
    };

    /**
     * Clear device ID and reset to new one
     */
    const resetDeviceId = () => {
        console.log('🔄 Resetting device ID...');
        clearDeviceId();
        const newId = getOrCreateDeviceId();
        setDeviceId(newId);
        return newId;
    };

    /**
     * Check if device is ready for API calls
     */
    const isReady = !loading && !!deviceId && !error;

    const value = {
        deviceId,
        loading,
        error,
        isReady,
        refreshDeviceId,
        resetDeviceId,
        initializeDeviceId
    };

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
}

/**
 * Hook to use device context
 * @returns {Object} Device context value
 */
export function useDevice() {
    const context = useContext(DeviceContext);
    
    if (!context) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    
    return context;
}

/**
 * Hook that waits for device to be ready before executing
 * Useful for API calls that need device ID
 * @param {Function} callback - Function to execute when device is ready
 * @param {Array} dependencies - useEffect dependencies
 */
export function useDeviceReady(callback, dependencies = []) {
    const { isReady, deviceId } = useDevice();

    useEffect(() => {
        if (isReady && deviceId) {
            callback();
        }
    }, [isReady, deviceId, ...dependencies]);
}

/**
 * Development helper component to show device status
 * Remove in production
 */
export function DeviceDebugInfo() {
    const { deviceId, loading, error, isReady } = useDevice();

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999
        }}>
            <div>Device ID: {deviceId ? deviceId.substring(0, 8) + '...' : 'None'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Ready: {isReady ? 'Yes' : 'No'}</div>
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </div>
    );
}