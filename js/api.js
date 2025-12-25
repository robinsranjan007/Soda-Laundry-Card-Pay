// Mock API service for Soda Laundry
// This will be replaced with real API calls later

const API = {
    // Base URL for mock data
    baseUrl: './mock-data',

    /**
     * Get machine status from Huebsch API
     * @param {number|null} machineId - Optional machine ID to filter
     * @returns {Promise<Object>} Machine status data
     */
    async getMachineStatus(machineId = null) {
        try {
            const response = await fetch(`${this.baseUrl}/machines-status.json`);
            const data = await response.json();
            
            if (machineId) {
                const machine = data.data.find(m => m.soda_id === parseInt(machineId));
                return { data: machine ? [machine] : [] };
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching machine status:', error);
            return { data: [] };
        }
    },

    /**
     * Get retail products
     * @returns {Promise<Object>} Products data
     */
    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/products.json`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { products: [] };
        }
    },

    /**
     * Check if machines are still available before payment
     * @param {Array<number>} machineIds - Array of machine IDs to check
     * @returns {Promise<Object>} Availability status
     */
    async checkMachineAvailability(machineIds) {
        try {
            const response = await this.getMachineStatus();
            const machines = response.data.filter(m => machineIds.includes(m.soda_id));
            
            const unavailable = machines.filter(m => 
                m.statusId === 'IN_USE' || m.statusId === 'COMPLETE'
            );
            
            return {
                available: unavailable.length === 0,
                unavailableMachines: unavailable.map(m => m.soda_id)
            };
        } catch (error) {
            console.error('Error checking availability:', error);
            return { available: false, unavailableMachines: [] };
        }
    },

    /**
     * Mock payment processing
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} Payment result
     */
    async processPayment(orderData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock success (90% success rate for testing)
        const success = Math.random() > 0.1;
        
        if (success) {
            return {
                success: true,
                transactionId: 'txn_' + Date.now(),
                orderId: 'order_' + Date.now()
            };
        } else {
            return {
                success: false,
                error: 'Payment declined'
            };
        }
    },

    /**
     * Create order in CleanCloud (mock)
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} Order result
     */
    async createOrder(orderData) {
        // This will call POST https://cleancloudapp.com/api/addOrder
        console.log('Creating order in CleanCloud:', orderData);
        
        // Mock response
        return {
            success: true,
            orderId: 'cc_order_' + Date.now()
        };
    },

    /**
     * Start machines via Huebsch WebSocket (mock)
     * @param {Array<Object>} machines - Array of machines with cycles
     * @returns {Promise<Object>} Result
     */
    async startMachines(machines) {
        // This will call Huebsch WebSocket to:
        // - Set vending amount on machines
        // - Set cycle on machines
        console.log('Starting machines:', machines);
        
        // Mock response
        return {
            success: true,
            machines: machines.map(m => ({
                machineId: m.machineId,
                started: true
            }))
        };
    }
};