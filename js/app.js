// Main application logic and navigation

const App = {
    currentScreen: null,
    openAccordions: new Set(),
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Soda Laundry App...');
        
        // Check for machine_id in URL
        const machineId = Utils.getUrlParam('machine_id');
        
        if (machineId) {
            await this.handleMachineQRCode(machineId);
        } else {
            // No machine ID - show welcome screen
            await this.navigateTo('welcome');
        }
        
        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.screen) {
                this.loadScreen(event.state.screen, event.state.data);
            }
        });
    },

    /**
     * Handle QR code scan with machine ID
     * @param {string} machineId - Machine ID from QR code
     */
    async handleMachineQRCode(machineId) {
        const machineInfo = getMachineType(machineId);
        
        if (!machineInfo) {
            Utils.showToast('Invalid machine ID', 'error');
            await this.navigateTo('welcome');
            return;
        }
        
        // Pre-select this machine and go to appropriate screen
        if (machineInfo.type === 'washer') {
            Cart.setSelectedWashers([parseInt(machineId)]);
            await this.navigateTo('select-washers', { preselected: machineId });
        } else {
            Cart.setSelectedDryers([parseInt(machineId)]);
            await this.navigateTo('select-dryers', { preselected: machineId });
        }
    },

    /**
     * Navigate to a screen
     * @param {string} screenName - Screen name
     * @param {Object} data - Optional data to pass to screen
     */
    async navigateTo(screenName, data = {}) {
        try {
            await this.loadScreen(screenName, data);
            
            // Update browser history
            history.pushState(
                { screen: screenName, data: data },
                '',
                `#${screenName}`
            );
            
            Utils.scrollToTop();
        } catch (error) {
            console.error('Navigation error:', error);
            Utils.showToast('Error loading screen', 'error');
        }
    },

    /**
     * Load a screen from the screens folder
     * @param {string} screenName - Screen name
     * @param {Object} data - Optional data
     */
async loadScreen(screenName, data = {}) {
    try {
        const response = await fetch(`screens/${screenName}.html`);
        const html = await response.text();
        
        document.getElementById('app').innerHTML = html;
        this.currentScreen = screenName;
        
        // Wait for next frame to ensure DOM is rendered
        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                await this.initScreen(screenName, data);
            });
        });
        
    } catch (error) {
        console.error('Error loading screen:', error);
        throw error;
    }
},
    /**
     * Initialize screen-specific functionality
     * @param {string} screenName - Screen name
     * @param {Object} data - Screen data
     */
    async initScreen(screenName, data) {
        switch(screenName) {
            case 'welcome':
                this.initWelcomeScreen(data);
                break;
            case 'select-machine-type':
                this.initSelectMachineTypeScreen();
                break;
            case 'select-washers':
                await this.initSelectWashersScreen(data);
                break;
            case 'select-washer-cycles':
                await this.initSelectWasherCyclesScreen();
                break;
            case 'select-dryers':
                await this.initSelectDryersScreen(data);
                break;
            case 'select-dryer-cycles':
                await this.initSelectDryerCyclesScreen();
                break;
            case 'retail-items':
                await this.initRetailItemsScreen();
                break;
            case 'review-cart':
                await this.initReviewCartScreen();
                break;
            case 'payment-mock':
                this.initPaymentMockScreen();
                break;
            case 'payment-success':
                await this.initPaymentSuccessScreen();
                break;
        }
    },

    /**
     * Welcome screen initialization
     */
    initWelcomeScreen(data) {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.navigateTo('select-machine-type');
            });
        }
    },

    /**
     * Select machine type screen initialization
     */
    initSelectMachineTypeScreen() {
        const washerBtn = document.getElementById('select-washer-btn');
        const dryerBtn = document.getElementById('select-dryer-btn');
        
        if (washerBtn) {
            washerBtn.addEventListener('click', () => {
                this.navigateTo('select-washers');
            });
        }
        
        if (dryerBtn) {
            dryerBtn.addEventListener('click', () => {
                this.navigateTo('select-dryers');
            });
        }
    },

    /**
     * Select washers screen initialization
     */
async initSelectWashersScreen(data) {
    console.log('Init select washers screen', data);
    
    // Get machine status from API
    const statusData = await API.getMachineStatus();
    const allWashers = statusData.data.filter(m => {
        // Filter only washers (IDs 21-24, 41-44, 61-63)
        return m.soda_id >= 21 && m.soda_id <= 63;
    });
    
    // Get selected washers from cart
    let selectedWashers = Cart.getSelectedWashers();
    
    // If preselected machine, make sure it's in the cart
    if (data.preselected) {
        const machineId = parseInt(data.preselected);
        if (!selectedWashers.includes(machineId)) {
            selectedWashers.push(machineId);
            Cart.setSelectedWashers(selectedWashers);
        }
    }
    
    // Render washers
    this.renderWashers(allWashers, selectedWashers);
    
    // Toggle for showing busy machines
    const toggle = document.getElementById('show-busy-toggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            this.renderWashers(allWashers, Cart.getSelectedWashers(), e.target.checked);
        });
    }
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        this.updateContinueButton();
        continueBtn.addEventListener('click', () => {
            if (Cart.getSelectedWashers().length > 0) {
                this.navigateTo('select-washer-cycles');
            }
        });
    }
},

renderWashers(washers, selectedWashers, showBusy = false) {
    const washersList = document.getElementById('washers-list');
    if (!washersList) return;
    
    // Filter based on showBusy toggle
    let displayWashers = washers;
    if (!showBusy) {
        displayWashers = washers.filter(w => 
            w.statusId === 'AVAILABLE' || selectedWashers.includes(w.soda_id)
        );
    }
    
    // Group by category
    const smallWashers = displayWashers.filter(w => w.soda_id >= 21 && w.soda_id <= 24);
    const mediumWashers = displayWashers.filter(w => w.soda_id >= 41 && w.soda_id <= 44);
    const largeWashers = displayWashers.filter(w => w.soda_id >= 61 && w.soda_id <= 63);
    
    let html = '';
    
    // Small Washers
    if (smallWashers.length > 0) {
        html += '<div class="mb-2"><h3 class="text-sm font-semibold text-gray-600 mb-2">Small (20 lbs) - $5.00</h3></div>';
        html += this.renderWasherCards(smallWashers, selectedWashers);
    }
    
    // Medium Washers
    if (mediumWashers.length > 0) {
        html += '<div class="mb-2 mt-4"><h3 class="text-sm font-semibold text-gray-600 mb-2">Medium (40 lbs) - $8.50</h3></div>';
        html += this.renderWasherCards(mediumWashers, selectedWashers);
    }
    
    // Large Washers
    if (largeWashers.length > 0) {
        html += '<div class="mb-2 mt-4"><h3 class="text-sm font-semibold text-gray-600 mb-2">Large (60 lbs) - $13.00</h3></div>';
        html += this.renderWasherCards(largeWashers, selectedWashers);
    }
    
    washersList.innerHTML = html;
    
    // Add click handlers
    displayWashers.forEach(washer => {
        const card = document.getElementById(`washer-${washer.soda_id}`);
        if (card && washer.statusId === 'AVAILABLE') {
            card.addEventListener('click', () => {
                this.toggleWasherSelection(washer.soda_id);
            });
        }
    });
},

renderWasherCards(washers, selectedWashers) {
    return washers.map(washer => {
        const isSelected = selectedWashers.includes(washer.soda_id);
        const isAvailable = washer.statusId === 'AVAILABLE';
        const isBusy = washer.statusId === 'IN_USE' || washer.statusId === 'COMPLETE';
        
        let statusBadge = '';
        let cardClass = 'machine-card bg-white rounded-xl p-4 border-2 ';
        
        if (isSelected) {
            cardClass += 'border-blue-600 bg-blue-50';
        } else if (isBusy) {
            cardClass += 'border-gray-200 busy';
        } else {
            cardClass += 'border-gray-200 hover:border-blue-400';
        }
        
        if (isAvailable) {
            statusBadge = '<span class="status-badge status-available">Available</span>';
        } else if (washer.statusId === 'IN_USE') {
            const timeLeft = Utils.formatTime(washer.remainingSeconds);
            statusBadge = `<span class="status-badge status-in-use">In Use (${timeLeft} left)</span>`;
        } else if (washer.statusId === 'COMPLETE') {
            statusBadge = '<span class="status-badge status-complete">Complete</span>';
        }
        
        return `
            <div id="washer-${washer.soda_id}" class="${cardClass}">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-lg font-bold text-gray-900">Washer #${washer.soda_id}</h3>
                            ${isSelected ? '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>' : ''}
                        </div>
                        ${statusBadge}
                    </div>
                </div>
            </div>
        `;
    }).join('');
},

toggleWasherSelection(washerId) {
    const selectedWashers = Cart.getSelectedWashers();
    
    if (selectedWashers.includes(washerId)) {
        Cart.removeWasher(washerId);
    } else {
        Cart.addWasher(washerId);
    }
    
    // Re-render
    API.getMachineStatus().then(statusData => {
        const allWashers = statusData.data.filter(m => m.soda_id >= 21 && m.soda_id <= 63);
        const toggle = document.getElementById('show-busy-toggle');
        this.renderWashers(allWashers, Cart.getSelectedWashers(), toggle ? toggle.checked : false);
        this.updateContinueButton();
    });
},

updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const countSpan = document.getElementById('washer-count');
    const count = Cart.getSelectedWashers().length;
    
    if (countSpan) {
        countSpan.textContent = count;
    }
    
    if (continueBtn) {
        if (count > 0) {
            continueBtn.disabled = false;
            continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
            continueBtn.classList.add('bg-blue-600', 'hover:shadow-xl', 'active:scale-95');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
            continueBtn.classList.remove('bg-blue-600', 'hover:shadow-xl', 'active:scale-95');
        }
    }
},

    /**
     * Select washer cycles screen initialization
     */
 async initSelectWasherCyclesScreen() {
    console.log('Init select washer cycles screen');
    
    // Get selected washers from cart
    const selectedWasherIds = Cart.getSelectedWashers();
    
    if (selectedWasherIds.length === 0) {
        this.navigateTo('select-washers');
        return;
    }
    
    // Get washer details and cycles
    const washersWithCycles = selectedWasherIds.map(washerId => {
        const machineInfo = getMachineType(washerId);
        const cycles = getCyclesForMachine(machineInfo.machine.category);
        
        // Get existing cycle selection or set default AND SAVE IT
        const existingCycles = Cart.getWasherCycles();
        let selectedCycle = existingCycles[washerId];
        
        if (!selectedCycle) {
            // Create default cycle and SAVE to cart
            selectedCycle = {
                washerId: washerId,
                cycle: cycles[0],
                temperature: cycles[0].temperatures[0],
                price: cycles[0].price
            };
            Cart.setWasherCycle(washerId, selectedCycle);  // ← SAVE IT!
        }
        
        return {
            washerId: washerId,
            category: machineInfo.machine.category,
            size: machineInfo.machine.size,
            cycles: cycles,
            selectedCycle: selectedCycle
        };
    });
    
    // Render cycles
    this.renderWasherCycles(washersWithCycles);
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            this.navigateTo('retail-items');
        });
    }
},

renderWasherCycles(washersWithCycles) {
    const cyclesList = document.getElementById('cycles-list');
    if (!cyclesList) return;
    
    let html = '';
    
    washersWithCycles.forEach((washer, index) => {
        const sizeLabel = washer.category === 'S' ? 'Small (20 lbs)' : 
                         washer.category === 'M' ? 'Medium (40 lbs)' : 
                         'Large (60 lbs)';
        
        html += `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <!-- Washer Header -->
                <button onclick="App.toggleAccordion(${washer.washerId})" 
                        class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div class="text-left">
                        <h3 class="font-bold text-gray-900">Washer #${washer.washerId}</h3>
                        <p class="text-sm text-gray-500">${sizeLabel} - ${Utils.formatPrice(washer.selectedCycle.price)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">${washer.selectedCycle.cycle.name} / ${washer.selectedCycle.temperature.name}</span>
                        <svg id="arrow-${washer.washerId}" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </button>
                
                <!-- Accordion Content -->
                <div id="accordion-${washer.washerId}" class="accordion-content">
                    <div class="px-4 pb-4 border-t">
                        <!-- Cycles -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">Cycle Type</h4>
                            <div class="space-y-2">
                                ${this.renderCycleOptions(washer)}
                            </div>
                        </div>
                        
                        <!-- Temperatures -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">Temperature</h4>
                            <div class="flex gap-2">
                                ${this.renderTemperatureOptions(washer)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cyclesList.innerHTML = html;
    
cyclesList.innerHTML = html;

// Restore previously opened accordions
if (this.openAccordions.size === 0 && washersWithCycles.length > 0) {
    // If no accordions were open, open the first one by default
    const firstWasherId = washersWithCycles[0].washerId;
    this.openAccordions.add(firstWasherId);
}

// Apply open state to accordions
this.openAccordions.forEach(washerId => {
    const accordion = document.getElementById(`accordion-${washerId}`);
    const arrow = document.getElementById(`arrow-${washerId}`);
    if (accordion && arrow) {
        accordion.classList.add('open');
        arrow.style.transform = 'rotate(180deg)';
    }
});
},

renderCycleOptions(washer) {
    return washer.cycles.map(cycle => {
        const isSelected = washer.selectedCycle.cycle.id === cycle.id;
        return `
            <label class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}">
                <div class="flex items-center gap-3">
                    <input type="radio" 
                           name="cycle-${washer.washerId}" 
                           value="${cycle.id}"
                           ${isSelected ? 'checked' : ''}
                           onchange="App.updateCycleSelection(${washer.washerId}, '${cycle.id}')"
                           class="w-4 h-4 text-blue-600">
                    <div>
                        <div class="font-medium text-gray-900">${cycle.name}</div>
                        <div class="text-xs text-gray-500">${cycle.duration}</div>
                    </div>
                </div>
                <span class="font-semibold text-gray-900">${Utils.formatPrice(cycle.price)}</span>
            </label>
        `;
    }).join('');
},

renderTemperatureOptions(washer) {
    const currentCycle = washer.cycles.find(c => c.id === washer.selectedCycle.cycle.id);
    if (!currentCycle) return '';
    
    return currentCycle.temperatures.map(temp => {
        const isSelected = washer.selectedCycle.temperature.id === temp.id;
        return `
            <button onclick="App.updateTemperatureSelection(${washer.washerId}, '${temp.id}')"
                    class="flex-1 py-2 px-4 rounded-lg border-2 font-medium ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-blue-300'}">
                ${temp.name}
            </button>
        `;
    }).join('');
},

toggleAccordion(washerId) {
    const accordion = document.getElementById(`accordion-${washerId}`);
    const arrow = document.getElementById(`arrow-${washerId}`);
    
    if (accordion && arrow) {
        accordion.classList.toggle('open');
        arrow.style.transform = accordion.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        
        // Track which accordions are open
        if (accordion.classList.contains('open')) {
            this.openAccordions.add(washerId);
        } else {
            this.openAccordions.delete(washerId);
        }
    }
},

updateCycleSelection(washerId, cycleId) {
    const machineInfo = getMachineType(washerId);
    const cycles = getCyclesForMachine(machineInfo.machine.category);
    const selectedCycle = cycles.find(c => c.id === cycleId);
    
    if (selectedCycle) {
        const cycleData = {
            washerId: washerId,
            cycle: selectedCycle,
            temperature: selectedCycle.temperatures[0], // Default to first temp
            price: selectedCycle.price
        };
        
        Cart.setWasherCycle(washerId, cycleData);
        
        // Re-render without re-fetching
        const selectedWasherIds = Cart.getSelectedWashers();
        const washersWithCycles = selectedWasherIds.map(wId => {
            const mInfo = getMachineType(wId);
            const cyc = getCyclesForMachine(mInfo.machine.category);
            const existingCycles = Cart.getWasherCycles();
            
            return {
                washerId: wId,
                category: mInfo.machine.category,
                size: mInfo.machine.size,
                cycles: cyc,
                selectedCycle: existingCycles[wId] || {
                    washerId: wId,
                    cycle: cyc[0],
                    temperature: cyc[0].temperatures[0],
                    price: cyc[0].price
                }
            };
        });
        
        this.renderWasherCycles(washersWithCycles);
    }
},

updateTemperatureSelection(washerId, temperatureId) {
    const existingCycles = Cart.getWasherCycles();
    const washerCycle = existingCycles[washerId];
    
    if (washerCycle && washerCycle.cycle && washerCycle.cycle.temperatures) {
        const temperature = washerCycle.cycle.temperatures.find(t => t.id === temperatureId);
        if (temperature) {
            washerCycle.temperature = temperature;
            Cart.setWasherCycle(washerId, washerCycle);
            
            // Re-render without re-fetching
            const selectedWasherIds = Cart.getSelectedWashers();
            const washersWithCycles = selectedWasherIds.map(wId => {
                const mInfo = getMachineType(wId);
                const cyc = getCyclesForMachine(mInfo.machine.category);
                const existCycles = Cart.getWasherCycles();
                
                return {
                    washerId: wId,
                    category: mInfo.machine.category,
                    size: mInfo.machine.size,
                    cycles: cyc,
                    selectedCycle: existCycles[wId] || {
                        washerId: wId,
                        cycle: cyc[0],
                        temperature: cyc[0].temperatures[0],
                        price: cyc[0].price
                    }
                };
            });
            
            this.renderWasherCycles(washersWithCycles);
        }
    }
},

    /**
     * Select dryers screen initialization
     */
   async initSelectDryersScreen(data) {
    console.log('Init select dryers screen', data);
    
    // Get machine status from API
    const statusData = await API.getMachineStatus();
    const allDryers = statusData.data.filter(m => {
        // Filter only dryers (IDs 1-10)
        return m.soda_id >= 1 && m.soda_id <= 10;
    });
    
    // Get selected dryers from cart
    let selectedDryers = Cart.getSelectedDryers();
    
    // If preselected machine, make sure it's in the cart
    if (data.preselected) {
        const machineId = parseInt(data.preselected);
        if (!selectedDryers.includes(machineId)) {
            selectedDryers.push(machineId);
            Cart.setSelectedDryers(selectedDryers);
        }
    }
    
    // Render dryers
    this.renderDryers(allDryers, selectedDryers);
    
    // Toggle for showing busy machines
    const toggle = document.getElementById('show-busy-toggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            this.renderDryers(allDryers, Cart.getSelectedDryers(), e.target.checked);
        });
    }
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        this.updateDryerContinueButton();
        continueBtn.addEventListener('click', () => {
            if (Cart.getSelectedDryers().length > 0) {
                this.navigateTo('select-dryer-cycles');
            }
        });
    }
},

renderDryers(dryers, selectedDryers, showBusy = false) {
    const dryersList = document.getElementById('dryers-list');
    if (!dryersList) return;
    
    // Filter based on showBusy toggle
    let displayDryers = dryers;
    if (!showBusy) {
        displayDryers = dryers.filter(d => 
            d.statusId === 'AVAILABLE' || selectedDryers.includes(d.soda_id)
        );
    }
    
    // Group by location
    const topDryers = displayDryers.filter(d => d.soda_id % 2 === 1); // Odd numbers = top
    const bottomDryers = displayDryers.filter(d => d.soda_id % 2 === 0); // Even = bottom
    
    let html = '';
    
    // Top Dryers
    if (topDryers.length > 0) {
        html += '<div class="mb-2"><h3 class="text-sm font-semibold text-gray-600 mb-2">Top Dryers</h3></div>';
        html += this.renderDryerCards(topDryers, selectedDryers);
    }
    
    // Bottom Dryers
    if (bottomDryers.length > 0) {
        html += '<div class="mb-2 mt-4"><h3 class="text-sm font-semibold text-gray-600 mb-2">Bottom Dryers</h3></div>';
        html += this.renderDryerCards(bottomDryers, selectedDryers);
    }
    
    dryersList.innerHTML = html;
    
    // Add click handlers
    displayDryers.forEach(dryer => {
        const card = document.getElementById(`dryer-${dryer.soda_id}`);
        if (card && dryer.statusId === 'AVAILABLE') {
            card.addEventListener('click', () => {
                this.toggleDryerSelection(dryer.soda_id);
            });
        }
    });
},

renderDryerCards(dryers, selectedDryers) {
    return dryers.map(dryer => {
        const isSelected = selectedDryers.includes(dryer.soda_id);
        const isAvailable = dryer.statusId === 'AVAILABLE';
        const isBusy = dryer.statusId === 'IN_USE' || dryer.statusId === 'COMPLETE';
        
        let statusBadge = '';
        let cardClass = 'machine-card bg-white rounded-xl p-4 border-2 ';
        
        if (isSelected) {
            cardClass += 'border-blue-600 bg-blue-50';
        } else if (isBusy) {
            cardClass += 'border-gray-200 busy';
        } else {
            cardClass += 'border-gray-200 hover:border-blue-400';
        }
        
        if (isAvailable) {
            statusBadge = '<span class="status-badge status-available">Available</span>';
        } else if (dryer.statusId === 'IN_USE') {
            const timeLeft = Utils.formatTime(dryer.remainingSeconds);
            statusBadge = `<span class="status-badge status-in-use">In Use (${timeLeft} left)</span>`;
        } else if (dryer.statusId === 'COMPLETE') {
            statusBadge = '<span class="status-badge status-complete">Complete</span>';
        }
        
        return `
            <div id="dryer-${dryer.soda_id}" class="${cardClass}">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-lg font-bold text-gray-900">Dryer #${dryer.soda_id}</h3>
                            ${isSelected ? '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>' : ''}
                        </div>
                        ${statusBadge}
                    </div>
                </div>
            </div>
        `;
    }).join('');
},

toggleDryerSelection(dryerId) {
    const selectedDryers = Cart.getSelectedDryers();
    
    if (selectedDryers.includes(dryerId)) {
        Cart.removeDryer(dryerId);
    } else {
        Cart.addDryer(dryerId);
    }
    
    // Re-render
    API.getMachineStatus().then(statusData => {
        const allDryers = statusData.data.filter(m => m.soda_id >= 1 && m.soda_id <= 10);
        const toggle = document.getElementById('show-busy-toggle');
        this.renderDryers(allDryers, Cart.getSelectedDryers(), toggle ? toggle.checked : false);
        this.updateDryerContinueButton();
    });
},

updateDryerContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const countSpan = document.getElementById('dryer-count');
    const count = Cart.getSelectedDryers().length;
    
    if (countSpan) {
        countSpan.textContent = count;
    }
    
    if (continueBtn) {
        if (count > 0) {
            continueBtn.disabled = false;
            continueBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
            continueBtn.classList.add('bg-blue-600');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
            continueBtn.classList.remove('bg-blue-600');
        }
    }
},

    /**
     * Select dryer cycles screen initialization
     */
    async initSelectDryerCyclesScreen() {
    console.log('Init select dryer cycles screen');
    
    // Get selected dryers from cart
    const selectedDryerIds = Cart.getSelectedDryers();
    
    if (selectedDryerIds.length === 0) {
        this.navigateTo('select-dryers');
        return;
    }
    
    // Get dryer details and cycles
    const dryersWithCycles = selectedDryerIds.map(dryerId => {
        const cycles = CONFIG.cycles.dryer_cycles;
        
        // Get existing cycle selection or set default AND SAVE IT
        const existingCycles = Cart.getDryerCycles();
        let selectedCycle = existingCycles[dryerId];
        
        if (!selectedCycle) {
            // Create default cycle and SAVE to cart
            selectedCycle = {
                dryerId: dryerId,
                cycle: cycles[0], // Default to HIGH
                duration: cycles[0].durations[1], // Default to 36 min
                price: cycles[0].durations[1].price
            };
            Cart.setDryerCycle(dryerId, selectedCycle);
        }
        
        return {
            dryerId: dryerId,
            cycles: cycles,
            selectedCycle: selectedCycle
        };
    });
    
    // Render cycles
    this.renderDryerCycles(dryersWithCycles);
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            this.navigateTo('retail-items');
        });
    }
},

renderDryerCycles(dryersWithCycles) {
    const cyclesList = document.getElementById('dryer-cycles-list');
    if (!cyclesList) return;
    
    let html = '';
    
    dryersWithCycles.forEach((dryer) => {
        html += `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <!-- Dryer Header -->
                <button onclick="App.toggleAccordion(${dryer.dryerId})" 
                        class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div class="text-left">
                        <h3 class="font-bold text-gray-900">Dryer #${dryer.dryerId}</h3>
                        <p class="text-sm text-gray-500">${Utils.formatPrice(dryer.selectedCycle.price)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">${dryer.selectedCycle.cycle.name} • ${dryer.selectedCycle.duration.minutes} min</span>
                        <svg id="arrow-${dryer.dryerId}" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </button>
                
                <!-- Accordion Content -->
                <div id="accordion-${dryer.dryerId}" class="accordion-content">
                    <div class="px-4 pb-4 border-t">
                        <!-- Heat Settings -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">Heat Setting</h4>
                            <div class="space-y-2">
                                ${this.renderDryerCycleOptions(dryer)}
                            </div>
                        </div>
                        
                        <!-- Duration -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">Duration</h4>
                            <div class="space-y-2">
                                ${this.renderDryerDurationOptions(dryer)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cyclesList.innerHTML = html;
    
    // Restore previously opened accordions
    if (this.openAccordions.size === 0 && dryersWithCycles.length > 0) {
        const firstDryerId = dryersWithCycles[0].dryerId;
        this.openAccordions.add(firstDryerId);
    }
    
    this.openAccordions.forEach(dryerId => {
        const accordion = document.getElementById(`accordion-${dryerId}`);
        const arrow = document.getElementById(`arrow-${dryerId}`);
        if (accordion && arrow) {
            accordion.classList.add('open');
            arrow.style.transform = 'rotate(180deg)';
        }
    });
},

renderDryerCycleOptions(dryer) {
    return dryer.cycles.map(cycle => {
        const isSelected = dryer.selectedCycle.cycle.id === cycle.id;
        return `
            <label class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}">
                <div class="flex items-center gap-3">
                    <input type="radio" 
                           name="dryer-cycle-${dryer.dryerId}" 
                           value="${cycle.id}"
                           ${isSelected ? 'checked' : ''}
                           onchange="App.updateDryerCycleSelection(${dryer.dryerId}, '${cycle.id}')"
                           class="w-4 h-4 text-blue-600">
                    <div class="font-medium text-gray-900">${cycle.name}</div>
                </div>
            </label>
        `;
    }).join('');
},

renderDryerDurationOptions(dryer) {
    const currentCycle = dryer.cycles.find(c => c.id === dryer.selectedCycle.cycle.id);
    if (!currentCycle) return '';
    
    return currentCycle.durations.map(duration => {
        const isSelected = dryer.selectedCycle.duration.minutes === duration.minutes;
        return `
            <label class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}">
                <div class="flex items-center gap-3">
                    <input type="radio" 
                           name="dryer-duration-${dryer.dryerId}" 
                           value="${duration.minutes}"
                           ${isSelected ? 'checked' : ''}
                           onchange="App.updateDryerDurationSelection(${dryer.dryerId}, ${duration.minutes})"
                           class="w-4 h-4 text-blue-600">
                    <div class="font-medium text-gray-900">${duration.minutes} minutes</div>
                </div>
                <span class="font-semibold text-gray-900">${Utils.formatPrice(duration.price)}</span>
            </label>
        `;
    }).join('');
},

updateDryerCycleSelection(dryerId, cycleId) {
    const cycles = CONFIG.cycles.dryer_cycles;
    const selectedCycle = cycles.find(c => c.id === cycleId);
    
    if (selectedCycle) {
        const cycleData = {
            dryerId: dryerId,
            cycle: selectedCycle,
            duration: selectedCycle.durations[1], // Default to 36 min
            price: selectedCycle.durations[1].price
        };
        
        Cart.setDryerCycle(dryerId, cycleData);
        
        // Re-render
        const selectedDryerIds = Cart.getSelectedDryers();
        const dryersWithCycles = selectedDryerIds.map(dId => {
            const cyc = CONFIG.cycles.dryer_cycles;
            const existingCycles = Cart.getDryerCycles();
            
            return {
                dryerId: dId,
                cycles: cyc,
                selectedCycle: existingCycles[dId]
            };
        });
        
        this.renderDryerCycles(dryersWithCycles);
    }
},

updateDryerDurationSelection(dryerId, minutes) {
    const existingCycles = Cart.getDryerCycles();
    const dryerCycle = existingCycles[dryerId];
    
    if (dryerCycle && dryerCycle.cycle && dryerCycle.cycle.durations) {
        const duration = dryerCycle.cycle.durations.find(d => d.minutes === minutes);
        if (duration) {
            dryerCycle.duration = duration;
            dryerCycle.price = duration.price;
            Cart.setDryerCycle(dryerId, dryerCycle);
            
            // Re-render
            const selectedDryerIds = Cart.getSelectedDryers();
            const dryersWithCycles = selectedDryerIds.map(dId => {
                const cyc = CONFIG.cycles.dryer_cycles;
                const existCycles = Cart.getDryerCycles();
                
                return {
                    dryerId: dId,
                    cycles: cyc,
                    selectedCycle: existCycles[dId]
                };
            });
            
            this.renderDryerCycles(dryersWithCycles);
        }
    }
},

    /**
     * Retail items screen initialization
     */
   async initRetailItemsScreen() {
    console.log('Init retail items screen');
    
    // Get products from API
    const productsData = await API.getProducts();
    const products = productsData.products || [];
    
    // Get already selected products from cart
    const selectedProducts = Cart.getSelectedProducts();
    
    // Render products
    this.renderProducts(products, selectedProducts);
    
    // Update button count
    this.updateItemCount();
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            this.navigateTo('review-cart');
        });
    }
},

renderProducts(products, selectedProducts) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Group products by category (you can customize this)
    const washerDetergent = products.filter(p => p.id <= 3);
    const dryerItems = products.filter(p => p.id === 4);
    const laundryBags = products.filter(p => p.id >= 5);
    
    let html = '<div class="space-y-6">';
    
    // Washer Detergent Section
    if (washerDetergent.length > 0) {
        html += `
            <div>
                <h3 class="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                    Washer Detergent
                </h3>
                <div class="space-y-2">
                    ${this.renderProductItems(washerDetergent, selectedProducts)}
                </div>
            </div>
        `;
    }
    
    // Dryer Sheet Section
    if (dryerItems.length > 0) {
        html += `
            <div>
                <h3 class="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                    Dryer Sheet
                </h3>
                <div class="space-y-2">
                    ${this.renderProductItems(dryerItems, selectedProducts)}
                </div>
            </div>
        `;
    }
    
    // Laundry Bags Section
    if (laundryBags.length > 0) {
        html += `
            <div>
                <h3 class="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                    Laundry Bags
                </h3>
                <div class="space-y-2">
                    ${this.renderProductItems(laundryBags, selectedProducts)}
                </div>
            </div>
        `;
    }
    
    // Footer note
    html += `
        <div class="text-center text-sm text-gray-500 mt-8 pb-4">
            Items will be handed to you by our on-site attendant!
        </div>
    `;
    
    html += '</div>';
    productsGrid.innerHTML = html;
},

renderProductItems(products, selectedProducts) {
    return products.map(product => {
        const selectedProduct = selectedProducts.find(p => p.id === product.id);
        const quantity = selectedProduct ? selectedProduct.quantity : 0;
        
        return `
            <div class="bg-white rounded-lg p-4 flex items-center justify-between">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${product.name}</h4>
                    <p class="text-sm font-semibold text-blue-600">${Utils.formatPrice(product.price)}</p>
                </div>
                
                ${quantity > 0 ? `
                    <div class="flex items-center gap-3">
                        <button onclick="App.decreaseProductQuantity(${product.id})" 
                                class="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 rounded border">
                            −
                        </button>
                        <span class="font-semibold text-gray-900 w-6 text-center">${quantity}</span>
                        <button onclick="App.increaseProductQuantity(${product.id})" 
                                class="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 rounded border">
                            +
                        </button>
                    </div>
                ` : `
                    <button onclick="App.addProductById(${product.id})" 
                            class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded">
                        Add
                    </button>
                `}
            </div>
        `;
    }).join('');
},
addProduct(product) {
    Cart.addProduct(product);
    
    // Re-render products
    API.getProducts().then(productsData => {
        const products = productsData.products || [];
        const selectedProducts = Cart.getSelectedProducts();
        this.renderProducts(products, selectedProducts);
        this.updateItemCount();
    });
},
addProductById(productId) {
    API.getProducts().then(productsData => {
        const products = productsData.products || [];
        const product = products.find(p => p.id === productId);
        
        if (product) {
            this.addProduct(product);
        }
    });
},

increaseProductQuantity(productId) {
    const selectedProducts = Cart.getSelectedProducts();
    const product = selectedProducts.find(p => p.id === productId);
    
    if (product) {
        Cart.updateProductQuantity(productId, product.quantity + 1);
        
        // Re-render products
        API.getProducts().then(productsData => {
            const products = productsData.products || [];
            const selectedProducts = Cart.getSelectedProducts();
            this.renderProducts(products, selectedProducts);
            this.updateItemCount();
        });
    }
},

decreaseProductQuantity(productId) {
    const selectedProducts = Cart.getSelectedProducts();
    const product = selectedProducts.find(p => p.id === productId);
    
    if (product) {
        Cart.updateProductQuantity(productId, product.quantity - 1);
        
        // Re-render products
        API.getProducts().then(productsData => {
            const products = productsData.products || [];
            const selectedProducts = Cart.getSelectedProducts();
            this.renderProducts(products, selectedProducts);
            this.updateItemCount();
        });
    }
},

updateItemCount() {
    const countSpan = document.getElementById('item-count');
    const selectedProducts = Cart.getSelectedProducts();
    const totalItems = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    if (countSpan) {
        countSpan.textContent = totalItems;
    }
},
    /**
     * Review cart screen initialization
     */
   async initReviewCartScreen() {
    console.log('Init review cart screen');
    
    // Get cart summary
    const cartSummary = Cart.getCartSummary();
    
    // Check if cart is empty
    if (cartSummary.washers.length === 0 && cartSummary.dryers.length === 0) {
        Utils.showToast('Your cart is empty', 'error');
        this.navigateTo('welcome');
        return;
    }
    
    // Render cart items
    this.renderCartSummary(cartSummary);
    
    // Payment button
    const paymentBtn = document.getElementById('payment-btn');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', () => {
            this.navigateTo('payment-mock');
        });
    }
},

renderCartSummary(cartSummary) {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;
    
    let html = '';
    
    // Washers Section
    if (cartSummary.washers.length > 0) {
        html += `
            <div class="bg-white rounded-xl shadow-sm p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Washers</h3>
                <div class="space-y-3">
                    ${this.renderWasherItems(cartSummary.washers, cartSummary.washerCycles)}
                </div>
            </div>
        `;
    }
    
    // Dryers Section
    if (cartSummary.dryers.length > 0) {
        html += `
            <div class="bg-white rounded-xl shadow-sm p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Dryers</h3>
                <div class="space-y-3">
                    ${this.renderDryerItems(cartSummary.dryers, cartSummary.dryerCycles)}
                </div>
            </div>
        `;
    }
    
    // Retail Products Section
    if (cartSummary.products.length > 0) {
        html += `
            <div class="bg-white rounded-xl shadow-sm p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Retail Items</h3>
                <div class="space-y-3">
                    ${this.renderCartProductItems(cartSummary.products)}
                </div>
            </div>
        `;
    }
    
    cartItems.innerHTML = html;
    cartTotal.textContent = Utils.formatPrice(cartSummary.total);
},

renderWasherItems(washerIds, washerCycles) {
    return washerIds.map(washerId => {
        const cycle = washerCycles[washerId];
        const machineInfo = getMachineType(washerId);
        
        if (!machineInfo) {
            return '';
        }
        
        const sizeLabel = machineInfo.machine.category === 'S' ? 'Small (20 lbs)' : 
                         machineInfo.machine.category === 'M' ? 'Medium (40 lbs)' : 
                         'Large (60 lbs)';
        
        // If no cycle configured, show with default price
        if (!cycle || !cycle.cycle || !cycle.temperature) {
            const defaultCycles = getCyclesForMachine(machineInfo.machine.category);
            const defaultPrice = defaultCycles && defaultCycles[0] ? defaultCycles[0].price : 0;
            
            return `
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                        <div class="font-medium text-gray-900">Washer #${washerId}</div>
                        <div class="text-sm text-gray-500">${sizeLabel} • Not configured</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-gray-900">${Utils.formatPrice(defaultPrice)}</div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-medium text-gray-900">Washer #${washerId}</div>
                    <div class="text-sm text-gray-500">${sizeLabel} • ${cycle.cycle.name} • ${cycle.temperature.name}</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(cycle.price)}</div>
                </div>
            </div>
        `;
    }).join('');
},

renderDryerItems(dryerIds, dryerCycles) {
    return dryerIds.map(dryerId => {
        const cycle = dryerCycles[dryerId];
        
        if (!cycle) {
            return `
                <div class="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                        <div class="font-medium text-gray-900">Dryer #${dryerId}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-gray-900">-</div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-medium text-gray-900">Dryer #${dryerId}</div>
                    <div class="text-sm text-gray-500">${cycle.cycle.name} • ${cycle.duration} min</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(cycle.price)}</div>
                </div>
            </div>
        `;
    }).join('');
},

renderCartProductItems(products) {
    return products.map(product => {
        return `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">Qty: ${product.quantity}</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(product.price * product.quantity)}</div>
                </div>
            </div>
        `;
    }).join('');
},

    /**
     * Payment mock screen initialization
     */
    initPaymentMockScreen() {
    console.log('Init payment mock screen');
    
    const successBtn = document.getElementById('success-btn');
    const failureBtn = document.getElementById('failure-btn');
    
    if (successBtn) {
        successBtn.addEventListener('click', async () => {
            // Simulate payment processing
            const cartSummary = Cart.getCartSummary();
            const result = await API.processPayment(cartSummary);
            
            if (result.success) {
                // Create order in CleanCloud
                await API.createOrder(cartSummary);
                
                // Start machines
                const machines = cartSummary.washers.map(wId => ({
                    machineId: wId,
                    cycle: cartSummary.washerCycles[wId]
                }));
                await API.startMachines(machines);
                
                // Navigate to success screen
                this.navigateTo('payment-success');
            }
        });
    }
    
    if (failureBtn) {
        failureBtn.addEventListener('click', () => {
            Utils.showToast('Payment failed. Please try again.', 'error');
            this.navigateTo('review-cart');
        });
    }
},
    /**
     * Payment success screen initialization
     */
   async initPaymentSuccessScreen() {
    console.log('Init payment success screen');
    
    // Get cart summary before clearing
    const cartSummary = Cart.getCartSummary();
    
    // Render order summary
    this.renderOrderSummary(cartSummary);
    
    // New transaction button
    const newTransactionBtn = document.getElementById('new-transaction-btn');
    if (newTransactionBtn) {
        newTransactionBtn.addEventListener('click', () => {
            // Clear cart and start fresh
            Cart.clear();
            this.openAccordions.clear();
            this.navigateTo('welcome');
        });
    }
},

renderOrderSummary(cartSummary) {
    const orderSummary = document.getElementById('order-summary');
    const totalPaid = document.getElementById('total-paid');
    
    if (!orderSummary || !totalPaid) return;
    
    let html = '';
    
    // Washers
    if (cartSummary.washers.length > 0) {
        cartSummary.washers.forEach(washerId => {
            const cycle = cartSummary.washerCycles[washerId];
            const machineInfo = getMachineType(washerId);
            const sizeLabel = machineInfo.machine.category === 'S' ? 'Small' : 
                             machineInfo.machine.category === 'M' ? 'Medium' : 'Large';
            
            if (cycle) {
                html += `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">Washer #${washerId} (${sizeLabel})</span>
                        <span class="font-semibold text-gray-900">${Utils.formatPrice(cycle.price)}</span>
                    </div>
                `;
            }
        });
    }
    
    // Dryers
    if (cartSummary.dryers.length > 0) {
        cartSummary.dryers.forEach(dryerId => {
            const cycle = cartSummary.dryerCycles[dryerId];
            
            if (cycle) {
                html += `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">Dryer #${dryerId}</span>
                        <span class="font-semibold text-gray-900">${Utils.formatPrice(cycle.price)}</span>
                    </div>
                `;
            }
        });
    }
    
    // Retail Products
    if (cartSummary.products.length > 0) {
        cartSummary.products.forEach(product => {
            html += `
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">${product.name} (x${product.quantity})</span>
                    <span class="font-semibold text-gray-900">${Utils.formatPrice(product.price * product.quantity)}</span>
                </div>
            `;
        });
    }
    
    orderSummary.innerHTML = html;
    totalPaid.textContent = Utils.formatPrice(cartSummary.total);
},
};

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});