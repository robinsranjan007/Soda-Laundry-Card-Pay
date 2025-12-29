// Main application logic and navigation

const App = {
    currentScreen: null,
    openAccordions: new Set(),

    /**
     * Initialize the application
     */
    async init() {
        console.log("Initializing Soda Laundry App...");

        // Check for machine_id in URL
        const machineId = Utils.getUrlParam("machine_id");

        if (machineId) {
            await this.handleMachineQRCode(machineId);
        } else {
            // No machine ID - show welcome screen
            await this.navigateTo("welcome");
        }

        // Handle browser back button
        window.addEventListener("popstate", (event) => {
            if (event.state && event.state.screen) {
                this.loadScreen(event.state.screen, event.state.data);
            }
        });
    },

    /**
     * Handle QR code scan with machine ID
     */
    async handleMachineQRCode(machineId) {
        const machineInfo = getMachineType(machineId);

        if (!machineInfo) {
            Utils.showToast("Invalid machine ID", "error");
            await this.navigateTo("welcome");
            return;
        }

        // Pre-select this machine and go to appropriate screen
        if (machineInfo.type === "washer") {
            Cart.setSelectedWashers([parseInt(machineId)]);
            await this.navigateTo("select-washers", { preselected: machineId });
        } else {
            Cart.setSelectedDryers([parseInt(machineId)]);
            await this.navigateTo("select-dryers", { preselected: machineId });
        }
    },

    /**
     * Navigate to a screen
     */
    async navigateTo(screenName, data = {}) {
        try {
            await this.loadScreen(screenName, data);

            // Update browser history
            history.pushState(
                { screen: screenName, data: data },
                "",
                `#${screenName}`
            );

            Utils.scrollToTop();
        } catch (error) {
            console.error("Navigation error:", error);
            Utils.showToast("Error loading screen", "error");
        }
    },

    /**
     * Load a screen from the screens folder
     */
    async loadScreen(screenName, data = {}) {
        try {
            const response = await fetch(`screens/${screenName}.html`);
            const html = await response.text();

            document.getElementById("app").innerHTML = html;
            this.currentScreen = screenName;

            // Wait for next frame to ensure DOM is rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(async () => {
                    await this.initScreen(screenName, data);
                });
            });
        } catch (error) {
            console.error("Error loading screen:", error);
            throw error;
        }
    },

    /**
     * Initialize screen-specific functionality
     */
    async initScreen(screenName, data) {
        switch (screenName) {
            case "welcome":
                this.initWelcomeScreen(data);
                break;
            case "select-machine-type":
                this.initSelectMachineTypeScreen();
                break;
            case "select-washers":
                await WashersScreen.init(data);
                break;
            case "select-washer-cycles":
                await WasherCyclesScreen.init();
                break;
            case "select-dryers":
                await DryersScreen.init(data);
                break;
            case "select-dryer-cycles":
                await DryerCyclesScreen.init();
                break;
            case "retail-items":
                await RetailItemsScreen.init();
                break;
            case "review-cart":
                await ReviewCartScreen.init();
                break;
            case "payment-mock":
                PaymentMockScreen.init();
                break;
            case "payment-success":
                await PaymentSuccessScreen.init();
                break;
        }
    },

    /**
     * Welcome screen initialization
     */
    initWelcomeScreen(data) {
        const startBtn = document.getElementById("start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                this.navigateTo("select-machine-type");
            });
        }
    },

    /**
     * Select machine type screen initialization
     */
    initSelectMachineTypeScreen() {
        const washerBtn = document.getElementById("select-washer-btn");
        const dryerBtn = document.getElementById("select-dryer-btn");

        if (washerBtn) {
            washerBtn.addEventListener("click", () => {
                this.navigateTo("select-washers");
            });
        }

        if (dryerBtn) {
            dryerBtn.addEventListener("click", () => {
                this.navigateTo("select-dryers");
            });
        }
    },

    // Accordion toggle method (used by washer/dryer cycles screens)
    toggleAccordion(machineId) {
        const accordion = document.getElementById(`accordion-${machineId}`);
        const arrow = document.getElementById(`arrow-${machineId}`);
        const header = document.getElementById(`header-${machineId}`) || 
                       document.getElementById(`header-btn-${machineId}`);
        
        if (accordion && arrow) {
            const isOpening = !accordion.classList.contains('open');
            
            accordion.classList.toggle('open');
            arrow.style.transform = accordion.classList.contains('open') ? 
                'rotate(180deg)' : 'rotate(0deg)';
            
            // Update header text color
            if (header) {
                const titleSpan = header.querySelector('.washer-title') || 
                                 header.querySelector('[class*="title"]');
                if (titleSpan) {
                    titleSpan.style.color = isOpening ? '#3B5998' : '#36373B';
                }
            }
            
            // Track which accordions are open
            if (accordion.classList.contains('open')) {
                this.openAccordions.add(machineId);
            } else {
                this.openAccordions.delete(machineId);
            }
        }
    },

    // Legacy methods for onclick handlers in HTML (will be removed when templates are updated)
    updateCycleSelection(washerId, cycleId) {
        if (WasherCyclesScreen && WasherCyclesScreen.updateCycleSelection) {
            WasherCyclesScreen.updateCycleSelection(washerId, cycleId);
        }
    },

    updateTemperatureSelection(washerId, temperatureId) {
        if (WasherCyclesScreen && WasherCyclesScreen.updateTemperatureSelection) {
            WasherCyclesScreen.updateTemperatureSelection(washerId, temperatureId);
        }
    },

    toggleExtraOption(washerId, optionId) {
        if (WasherCyclesScreen && WasherCyclesScreen.toggleExtraOption) {
            WasherCyclesScreen.toggleExtraOption(washerId, optionId);
        }
    },

    updateDryerCycleSelection(dryerId, cycleId) {
        if (DryerCyclesScreen && DryerCyclesScreen.updateCycleSelection) {
            DryerCyclesScreen.updateCycleSelection(dryerId, cycleId);
        }
    },

    updateDryerDurationSelection(dryerId, minutes) {
        if (DryerCyclesScreen && DryerCyclesScreen.updateDurationSelection) {
            DryerCyclesScreen.updateDurationSelection(dryerId, minutes);
        }
    },

    toggleDryerExtraOption(dryerId, optionId) {
        if (DryerCyclesScreen && DryerCyclesScreen.toggleExtraOption) {
            DryerCyclesScreen.toggleExtraOption(dryerId, optionId);
        }
    },

    addProductById(productId) {
        if (RetailItemsScreen && RetailItemsScreen.addProduct) {
            RetailItemsScreen.addProduct(productId);
        }
    },

    increaseProductQuantity(productId) {
        if (RetailItemsScreen && RetailItemsScreen.increaseQuantity) {
            RetailItemsScreen.increaseQuantity(productId);
        }
    },

    decreaseProductQuantity(productId) {
        if (RetailItemsScreen && RetailItemsScreen.decreaseQuantity) {
            RetailItemsScreen.decreaseQuantity(productId);
        }
    }
};

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});