// Cart and state management using localStorage

const Cart = {
    // Keys for localStorage
    KEYS: {
        WASHERS: 'soda_selected_washers',
        DRYERS: 'soda_selected_dryers',
        PRODUCTS: 'soda_selected_products',
        WASHER_CYCLES: 'soda_washer_cycles',
        DRYER_CYCLES: 'soda_dryer_cycles'
    },

    // Initialize cart
    init() {
        if (!localStorage.getItem(this.KEYS.WASHERS)) {
            this.clear();
        }
    },

    // Clear all cart data
    clear() {
    localStorage.setItem(this.KEYS.WASHERS, JSON.stringify([]));
    localStorage.setItem(this.KEYS.DRYERS, JSON.stringify([]));
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(this.KEYS.WASHER_CYCLES, JSON.stringify({}));  // ← Object!
    localStorage.setItem(this.KEYS.DRYER_CYCLES, JSON.stringify({}));   // ← Object!
},

    // Washers
    getSelectedWashers() {
        return JSON.parse(localStorage.getItem(this.KEYS.WASHERS) || '[]');
    },

    setSelectedWashers(washers) {
        localStorage.setItem(this.KEYS.WASHERS, JSON.stringify(washers));
    },

    addWasher(washerId) {
        const washers = this.getSelectedWashers();
        if (!washers.includes(washerId)) {
            washers.push(washerId);
            this.setSelectedWashers(washers);
        }
    },

    removeWasher(washerId) {
        const washers = this.getSelectedWashers();
        const filtered = washers.filter(id => id !== washerId);
        this.setSelectedWashers(filtered);
        
        // Also remove cycle config
        const cycles = this.getWasherCycles();
        delete cycles[washerId];
        this.setWasherCycles(cycles);
    },

    // Dryers
    getSelectedDryers() {
        return JSON.parse(localStorage.getItem(this.KEYS.DRYERS) || '[]');
    },

    setSelectedDryers(dryers) {
        localStorage.setItem(this.KEYS.DRYERS, JSON.stringify(dryers));
    },

    addDryer(dryerId) {
        const dryers = this.getSelectedDryers();
        if (!dryers.includes(dryerId)) {
            dryers.push(dryerId);
            this.setSelectedDryers(dryers);
        }
    },

    removeDryer(dryerId) {
        const dryers = this.getSelectedDryers();
        const filtered = dryers.filter(id => id !== dryerId);
        this.setSelectedDryers(filtered);
        
        // Also remove cycle config
        const cycles = this.getDryerCycles();
        delete cycles[dryerId];
        this.setDryerCycles(cycles);
    },

    // Washer Cycles
    getWasherCycles() {
        return JSON.parse(localStorage.getItem(this.KEYS.WASHER_CYCLES) || '{}');
    },

    setWasherCycles(cycles) {
        localStorage.setItem(this.KEYS.WASHER_CYCLES, JSON.stringify(cycles));
    },

    setWasherCycle(washerId, cycleData) {
        const cycles = this.getWasherCycles();
        cycles[washerId] = cycleData;
        this.setWasherCycles(cycles);
    },

    // Dryer Cycles
    getDryerCycles() {
        return JSON.parse(localStorage.getItem(this.KEYS.DRYER_CYCLES) || '{}');
    },

    setDryerCycles(cycles) {
        localStorage.setItem(this.KEYS.DRYER_CYCLES, JSON.stringify(cycles));
    },

    setDryerCycle(dryerId, cycleData) {
        const cycles = this.getDryerCycles();
        cycles[dryerId] = cycleData;
        this.setDryerCycles(cycles);
    },

    // Products
    getSelectedProducts() {
        return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS) || '[]');
    },

    setSelectedProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    addProduct(product) {
        const products = this.getSelectedProducts();
        const existing = products.find(p => p.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            products.push({ ...product, quantity: 1 });
        }
        
        this.setSelectedProducts(products);
    },

    removeProduct(productId) {
        const products = this.getSelectedProducts();
        const filtered = products.filter(p => p.id !== productId);
        this.setSelectedProducts(filtered);
    },

    updateProductQuantity(productId, quantity) {
        const products = this.getSelectedProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            if (quantity <= 0) {
                this.removeProduct(productId);
            } else {
                product.quantity = quantity;
                this.setSelectedProducts(products);
            }
        }
    },

    // Calculate totals
    calculateTotal() {
        let total = 0;

        // Washer prices
        const washerCycles = this.getWasherCycles();
        Object.values(washerCycles).forEach(cycle => {
            total += cycle.price || 0;
        });

        // Dryer prices
        const dryerCycles = this.getDryerCycles();
        Object.values(dryerCycles).forEach(cycle => {
            total += cycle.price || 0;
        });

        // Product prices
        const products = this.getSelectedProducts();
        products.forEach(product => {
            total += (product.price * product.quantity);
        });

        return total;
    },

    // Get complete cart summary
    getCartSummary() {
        return {
            washers: this.getSelectedWashers(),
            dryers: this.getSelectedDryers(),
            washerCycles: this.getWasherCycles(),
            dryerCycles: this.getDryerCycles(),
            products: this.getSelectedProducts(),
            total: this.calculateTotal()
        };
    }
};

// Initialize cart on load
Cart.init();