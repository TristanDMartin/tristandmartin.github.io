// JavaScript-based API for static hosting
// This file simulates an API endpoint using localStorage

(function() {
    'use strict';
    
    // Check if this is being called as an API endpoint
    if (typeof window !== 'undefined' && window.location.pathname.includes('/api/sync-avatar')) {
        handleAppSync();
    }
    
    function handleSyncRequest() {
        // Get the request data from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const method = urlParams.get('method') || 'GET';
        
        if (method === 'POST') {
            // Handle POST request (simulated)
            const syncData = JSON.parse(urlParams.get('data') || '{}');
            processSyncData(syncData);
            
            // Return success response
            document.write(JSON.stringify({
                status: 'success',
                message: 'Avatar synced successfully (JS API)',
                userId: syncData.userId,
                timestamp: new Date().toISOString()
            }));
        } else {
            // Handle GET request
            const userId = urlParams.get('userId');
            const syncData = getSyncData(userId);
            
            document.write(JSON.stringify(syncData));
        }
    }
    
    // Handle POST requests via URL parameters (for app integration)
    function handleAppSync() {
        const urlParams = new URLSearchParams(window.location.search);
        const postData = urlParams.get('postData');
        
        if (postData) {
            try {
                const syncData = JSON.parse(decodeURIComponent(postData));
                processSyncData(syncData);
                
                // Return success response
                document.write(JSON.stringify({
                    status: 'success',
                    message: 'Avatar synced successfully from app',
                    userId: syncData.userId,
                    timestamp: new Date().toISOString()
                }));
                return;
            } catch (error) {
                document.write(JSON.stringify({
                    status: 'error',
                    message: 'Invalid data format',
                    error: error.message
                }));
                return;
            }
        }
        
        // Fallback to regular handling
        handleSyncRequest();
    }
    
    function processSyncData(data) {
        if (!data.userId) return;
        
        // Store in localStorage
        const syncData = {
            userId: data.userId,
            profileData: {
                name: data.displayName || data.name,
                username: data.username,
                avatar: data.avatarBase64 || data.avatarURL,
                hasAvatar: !!(data.avatarBase64 || data.avatarURL),
                lastUpdated: new Date().toISOString(),
                source: 'app'
            },
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('websiteProfileSync', JSON.stringify(syncData));
        localStorage.setItem('appAvatar', data.avatarBase64 || data.avatarURL);
        localStorage.setItem('appProfile', JSON.stringify(syncData.profileData));
        
        // Trigger custom event for website
        window.dispatchEvent(new CustomEvent('appDataUpdated', {
            detail: {
                stats: null,
                posts: null,
                profile: syncData.profileData,
                avatar: data.avatarBase64 || data.avatarURL
            }
        }));
    }
    
    function getSyncData(userId) {
        const syncData = localStorage.getItem('websiteProfileSync');
        if (syncData) {
            const data = JSON.parse(syncData);
            if (data.userId === userId) {
                return data;
            }
        }
        
        return {
            status: 'not_found',
            message: 'No sync data found for user'
        };
    }
    
    // Expose functions globally for testing
    window.JSAPI = {
        processSyncData,
        getSyncData,
        handleSyncRequest
    };
    
})(); 