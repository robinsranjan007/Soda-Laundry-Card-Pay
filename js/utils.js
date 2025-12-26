// Utility functions for Soda Laundry

const Utils = {
    /**
     * Format price in cents to dollars
     * @param {number} cents - Price in cents
     * @returns {string} Formatted price (e.g., "$13.00")
     */
    formatPrice(cents) {
        return `$${(cents / 100).toFixed(2)}`;
    },

    /**
     * Format time in seconds to human readable
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time (e.g., "23 min")
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
        return `${minutes} min`;
    },

    /**
     * Get URL parameters
     * @returns {URLSearchParams} URL parameters
     */
    getUrlParams() {
        return new URLSearchParams(window.location.search);
    },

    /**
     * Get specific URL parameter
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    getUrlParam(param) {
        return this.getUrlParams().get(param);
    },

    /**
     * Show loading spinner
     */
    showLoading() {
        const loader = document.getElementById('loading-spinner');
        if (loader) {
            loader.classList.remove('hidden');
        }
    },

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const loader = document.getElementById('loading-spinner');
        if (loader) {
            loader.classList.add('hidden');
        }
    },

/**
 * Load header component into a container
 * @param {string} containerId - ID of container to load header into
 * @param {Function} backAction - Function to call when back button is clicked
 */
async loadHeader(containerId, backAction) {
    try {
        const response = await fetch('components/header.html');
        const html = await response.text();
        
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
            
            // Attach back button handler
            const backBtn = document.getElementById('back-btn');
            if (backBtn && backAction) {
                backBtn.addEventListener('click', backAction);
            }
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
},

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50`;
        
        switch(type) {
            case 'success':
                toast.className += ' bg-green-500 text-white';
                break;
            case 'error':
                toast.className += ' bg-red-500 text-white';
                break;
            default:
                toast.className += ' bg-blue-500 text-white';
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    /**
     * Scroll to top smoothly
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};