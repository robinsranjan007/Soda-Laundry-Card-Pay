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
   * @param {string} machineId - Machine ID from QR code
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
   * @param {string} screenName - Screen name
   * @param {Object} data - Optional data to pass to screen
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
   * @param {string} screenName - Screen name
   * @param {Object} data - Optional data
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
   * @param {string} screenName - Screen name
   * @param {Object} data - Screen data
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
        await this.initSelectWashersScreen(data);
        break;
      case "select-washer-cycles":
        await this.initSelectWasherCyclesScreen();
        break;
      case "select-dryers":
        await this.initSelectDryersScreen(data);
        break;
      case "select-dryer-cycles":
        await this.initSelectDryerCyclesScreen();
        break;
      case "retail-items":
        await this.initRetailItemsScreen();
        break;
      case "review-cart":
        await this.initReviewCartScreen();
        break;
      case "payment-mock":
        this.initPaymentMockScreen();
        break;
      case "payment-success":
        await this.initPaymentSuccessScreen();
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

  /**
   * Select washers screen initialization
   */
  async initSelectWashersScreen(data) {
    console.log("Init select washers screen", data);

    // Get machine status from API
    const statusData = await API.getMachineStatus();
    const allWashers = statusData.data.filter((m) => {
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
    const toggle = document.getElementById("show-busy-toggle");
    if (toggle) {
      toggle.addEventListener("change", (e) => {
        this.renderWashers(
          allWashers,
          Cart.getSelectedWashers(),
          e.target.checked
        );
      });
    }

    // Continue button
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
      this.updateContinueButton();
      continueBtn.addEventListener("click", () => {
        if (Cart.getSelectedWashers().length > 0) {
          this.navigateTo("select-washer-cycles");
        }
      });
    }
  },

  renderWashers(washers, selectedWashers, showBusy = false) {
    const washersList = document.getElementById("washers-list");
    if (!washersList) return;

    // Filter based on showBusy toggle
    let displayWashers = washers;
    if (!showBusy) {
      displayWashers = washers.filter(
        (w) => w.statusId === "AVAILABLE" || selectedWashers.includes(w.soda_id)
      );
    }

    // Group by category
    const largeWashers = displayWashers.filter(
      (w) => w.soda_id >= 61 && w.soda_id <= 63
    );
    const mediumWashers = displayWashers.filter(
      (w) => w.soda_id >= 41 && w.soda_id <= 44
    );
    const smallWashers = displayWashers.filter(
      (w) => w.soda_id >= 21 && w.soda_id <= 24
    );

    let html = "";

    // Large Washers (XL - showing first)
    if (largeWashers.length > 0) {
      html += `
            <div class="mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" 
                         style="background-color: #E8F5FF; color: #3B5998;">
                        XL
                    </div>
                </div>
                <div class="space-y-3">
                    ${this.renderWasherCards(largeWashers, selectedWashers)}
                </div>
            </div>
        `;
    }

    // Medium Washers (L)
    if (mediumWashers.length > 0) {
      html += `
            <div class="mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" 
                         style="background-color: #E8F5FF; color: #3B5998;">
                        L
                    </div>
                </div>
                <div class="space-y-3">
                    ${this.renderWasherCards(mediumWashers, selectedWashers)}
                </div>
            </div>
        `;
    }

    // Small Washers (M)
    if (smallWashers.length > 0) {
      html += `
            <div class="mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" 
                         style="background-color: #E8F5FF; color: #3B5998;">
                        M
                    </div>
                </div>
                <div class="space-y-3">
                    ${this.renderWasherCards(smallWashers, selectedWashers)}
                </div>
            </div>
        `;
    }

    washersList.innerHTML = html;

    // Add click handlers
    displayWashers.forEach((washer) => {
      const card = document.getElementById(`washer-${washer.soda_id}`);
      if (card && washer.statusId === "AVAILABLE") {
        card.addEventListener("click", () => {
          this.toggleWasherSelection(washer.soda_id);
        });
      }
    });
  },
renderWasherCards(washers, selectedWashers) {
  return washers
    .map((washer) => {
      const isSelected = selectedWashers.includes(washer.soda_id);
      const isAvailable = washer.statusId === "AVAILABLE";
      const isBusy = washer.statusId === "IN_USE";

      // Card styling
      let cardClass = "rounded-xl p-4 border transition-all ";
      let cardStyle = "";

      if (isBusy) {
        cardClass += "opacity-50 cursor-not-allowed border-gray-200 bg-white";
      } else if (isSelected) {
        cardClass += "border-2 cursor-pointer";
        cardStyle = "border-color: #00BC7D; background-color: #F0FFF9;";
      } else {
        cardClass +=
          "border-gray-200 cursor-pointer hover:border-blue-300 bg-white";
      }

      return `
        <div id="washer-${washer.soda_id}" class="${cardClass}" style="${cardStyle}">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <!-- Green Dot (only for available) -->
              ${
                isAvailable && !isBusy
                  ? `
                    <div class="w-2 h-2 rounded-full" style="background-color: #00BC7D;"></div>
                  `
                  : `
                    <div class="w-2 h-2"></div>
                  `
              }

              <!-- Machine Info -->
              <div class="flex-1">
                <h3 class="font-semibold mb-1" style="color: #36373B;">Washer ${washer.soda_id}</h3>
                <div class="flex items-center gap-1">
                  ${
                    isAvailable && !isBusy
                      ? `
                        <span class="text-sm font-medium" style="color: #00BC7D;">Available</span>
                      `
                      : isBusy
                      ? `
                        <svg class="w-4 h-4" fill="none" stroke="#FF6B6B" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-sm font-medium" style="color: #FF6B6B;">Busy (${Utils.formatTime(
                          washer.remainingSeconds
                        )} left)</span>
                      `
                      : ""
                  }
                </div>
              </div>
            </div>

            <!-- Price & Selected Icon -->
            <div class="flex items-center gap-3">
              <span class="font-bold" style="color: #3B5998;">${Utils.formatPrice(
                washer.remainingVend
              )}</span>
              ${
                isSelected
                  ? `
                    <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: #3B5998;">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");
},

  toggleWasherSelection(washerId) {
    const selectedWashers = Cart.getSelectedWashers();

    if (selectedWashers.includes(washerId)) {
      Cart.removeWasher(washerId);
    } else {
      Cart.addWasher(washerId);
    }

    // Re-render
    API.getMachineStatus().then((statusData) => {
      const allWashers = statusData.data.filter(
        (m) => m.soda_id >= 21 && m.soda_id <= 63
      );
      const toggle = document.getElementById("show-busy-toggle");
      this.renderWashers(
        allWashers,
        Cart.getSelectedWashers(),
        toggle ? toggle.checked : false
      );
      this.updateContinueButton();
    });
  },

  updateContinueButton() {
    const continueBtn = document.getElementById("continue-btn");
    const countSpan = document.getElementById("washer-count");
    const count = Cart.getSelectedWashers().length;

    if (countSpan) {
      countSpan.textContent = count;
    }

    if (continueBtn) {
      if (count > 0) {
        continueBtn.disabled = false;
        continueBtn.classList.remove("bg-gray-300", "cursor-not-allowed");
        continueBtn.classList.add(
          "bg-blue-600",
          "hover:shadow-xl",
          "active:scale-95"
        );
      } else {
        continueBtn.disabled = true;
        continueBtn.classList.add("bg-gray-300", "cursor-not-allowed");
        continueBtn.classList.remove(
          "bg-blue-600",
          "hover:shadow-xl",
          "active:scale-95"
        );
      }
    }
  },

  updateCyclesContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        const total = Cart.calculateTotal();
        continueBtn.innerHTML = `Continue • ${Utils.formatPrice(total)}`;
    }
},

  /**
   * Select washer cycles screen initialization
   */
  async initSelectWasherCyclesScreen() {
    console.log("Init select washer cycles screen");

    // Get selected washers from cart
    const selectedWasherIds = Cart.getSelectedWashers();

    if (selectedWasherIds.length === 0) {
      this.navigateTo("select-washers");
      return;
    }

    // Get washer details and cycles
    const washersWithCycles = selectedWasherIds.map((washerId) => {
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
          price: cycles[0].price,
        };
        Cart.setWasherCycle(washerId, selectedCycle); // ← SAVE IT!
      }

      return {
        washerId: washerId,
        category: machineInfo.machine.category,
        size: machineInfo.machine.size,
        cycles: cycles,
        selectedCycle: selectedCycle,
      };
    });

    // Render cycles
    this.renderWasherCycles(washersWithCycles);
    this.updateCyclesContinueButton();

     //continue btn
const continueBtn = document.getElementById('continue-btn');
if (continueBtn) {
    // Update button text with total price
    const total = Cart.calculateTotal();
    continueBtn.innerHTML = `Continue • ${Utils.formatPrice(total)}`;
    
    continueBtn.addEventListener('click', () => {
        this.navigateTo('retail-items');
    });
}
  },

 renderWasherCycles(washersWithCycles) {
    const cyclesList = document.getElementById('cycles-list');
    if (!cyclesList) return;
    
    let html = '';
    
    washersWithCycles.forEach((washer) => {
        const sizeLabel = washer.category === 'S' ? '(M)' : 
                         washer.category === 'M' ? '(L)' : 
                         '(XL)';
        
        html += `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <!-- Washer Header -->
               <button onclick="App.toggleAccordion(${washer.washerId})" 
        class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
        id="header-${washer.washerId}">
    <div class="flex items-center gap-2">
        <span class="font-bold washer-title" style="color: #36373B;">Washer ${washer.washerId} ${sizeLabel}</span>
    </div>
    <div class="flex items-center gap-3">
        <span class="font-semibold" style="color: #36373B;">${Utils.formatPrice(washer.selectedCycle.price)}</span>
        <svg id="arrow-${washer.washerId}" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
    </div>
</button>
                
                <!-- Accordion Content -->
                <div id="accordion-${washer.washerId}" class="accordion-content">
                    <div class="px-4 pb-4">
                        <!-- Cycle Type Section -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Cycle Type</h4>
                            <div class="space-y-2">
                                ${this.renderCycleOptions(washer)}
                            </div>
                        </div>
                        
                        <!-- Other Cycles Section -->
                        <div class="mt-6">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Other Cycles</h4>
                            <div class="space-y-2">
                                ${this.renderOtherCycleOptions(washer)}
                            </div>
                        </div>
                        
                        <!-- Temperature Section -->
                        <div class="mt-6">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Temperature</h4>
                            <div class="flex gap-2">
                                ${this.renderTemperatureOptions(washer)}
                            </div>
                        </div>
                        
                        <!-- Extra Options Section -->
                        <div class="mt-6">
                        <!-- Extra Options Section -->
<div class="mt-6">
    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Extra Options</h4>
    <div class="space-y-2">
        ${this.renderExtraOptions(washer)}
    </div>
</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cyclesList.innerHTML = html;
    
    // DON'T open any accordions by default - all should be collapsed
    this.openAccordions.clear();
},
renderCycleOptions(washer) {
    const mainCycles = washer.cycles.slice(0, 1); // Only show Normal under Cycle Type
    
    return mainCycles.map(cycle => {
        const isSelected = washer.selectedCycle.cycle.id === cycle.id;
        return `
            <button onclick="App.updateCycleSelection(${washer.washerId}, '${cycle.id}')"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="font-medium" style="color: #36373B;">${cycle.name}</span>
                <span class="text-sm font-medium" style="color: #A6A8AE;">${Utils.formatPrice(cycle.price)} • ${cycle.duration}</span>
            </button>
        `;
    }).join('');
},

renderOtherCycleOptions(washer) {
    const otherCycles = washer.cycles.slice(1); // Show remaining cycles
    
    return otherCycles.map(cycle => {
        const isSelected = washer.selectedCycle.cycle.id === cycle.id;
        return `
            <button onclick="App.updateCycleSelection(${washer.washerId}, '${cycle.id}')"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="font-medium" style="color: #36373B;">${cycle.name}</span>
                <span class="text-sm font-medium" style="color: #A6A8AE;">${Utils.formatPrice(cycle.price)} • ${cycle.duration}</span>
            </button>
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
                    class="flex-1 py-3 px-4 rounded-lg border transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #E8F5FF; color: #3B5998;' : 'background-color: white; color: #36373B;'}">
                ${temp.name}
            </button>
        `;
    }).join('');
},

renderExtraOptions(washer) {
    // Make sure we have the selected cycle
    if (!washer.selectedCycle || !washer.selectedCycle.cycle) {
        console.log('No selected cycle for washer', washer.washerId);
        return '';
    }
    
    const currentCycle = washer.cycles.find(c => c.id === washer.selectedCycle.cycle.id);
    
    if (!currentCycle) {
        console.log('Current cycle not found', washer.selectedCycle.cycle.id);
        return '';
    }
    
    if (!currentCycle.extraOptions || currentCycle.extraOptions.length === 0) {
        console.log('No extra options for cycle', currentCycle.name);
        return '<p class="text-sm text-gray-500">No extra options available</p>';
    }
    
    const selectedExtras = washer.selectedCycle.extraOptions || [];
    
    return currentCycle.extraOptions.map(option => {
        const isSelected = selectedExtras.some(e => e.id === option.id);
        return `
            <button onclick="App.toggleExtraOption(${washer.washerId}, '${option.id}')"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="text-sm font-medium" style="color: #36373B;">${option.name}</span>
                <span class="text-sm font-medium" style="color: #A6A8AE;">+${Utils.formatPrice(option.price)} • +${option.duration} min</span>
            </button>
        `;
    }).join('');
},

 toggleAccordion(washerId) {
    const accordion = document.getElementById(`accordion-${washerId}`);
    const arrow = document.getElementById(`arrow-${washerId}`);
    const header = document.getElementById(`header-${washerId}`);
    
    if (accordion && arrow) {
        const isOpening = !accordion.classList.contains('open');
        
        accordion.classList.toggle('open');
        arrow.style.transform = accordion.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        
        // Update header text color
        if (header) {
            const titleSpan = header.querySelector('.washer-title');
            if (titleSpan) {
                titleSpan.style.color = isOpening ? '#3B5998' : '#36373B';
            }
        }
        
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
            temperature: selectedCycle.temperatures[0],
            price: selectedCycle.price,
            extraOptions: [] // No extra options selected by default
        };
        
        Cart.setWasherCycle(washerId, cycleData);
        
        // Update only the specific washer's header and options
        // Don't re-render the entire list
        this.updateWasherCycleDisplay(washerId);
        this.updateCyclesContinueButton();
    }
},

updateWasherCycleDisplay(washerId) {
    const cycles = Cart.getWasherCycles();
    const washerCycle = cycles[washerId];
    
    if (!washerCycle) return;
    
    // Update header price
    const header = document.querySelector(`button[onclick="App.toggleAccordion(${washerId})"]`);
    if (header) {
        const priceSpan = header.querySelector('span.font-semibold');
        if (priceSpan) {
            priceSpan.textContent = Utils.formatPrice(washerCycle.price);
        }
    }
    
    // Re-render the entire accordion content to update all selections
    const accordion = document.getElementById(`accordion-${washerId}`);
    if (accordion) {
        const machineInfo = getMachineType(washerId);
        const allCycles = getCyclesForMachine(machineInfo.machine.category);
        
        const washerData = {
            washerId: washerId,
            category: machineInfo.machine.category,
            size: machineInfo.machine.size,
            cycles: allCycles,
            selectedCycle: washerCycle
        };
        
        // Get the content div (first child of accordion)
        const contentDiv = accordion.querySelector('div');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <!-- Cycle Type Section -->
                <div class="mt-4">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Cycle Type</h4>
                    <div class="space-y-2">
                        ${this.renderCycleOptions(washerData)}
                    </div>
                </div>
                
                <!-- Other Cycles Section -->
                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Other Cycles</h4>
                    <div class="space-y-2">
                        ${this.renderOtherCycleOptions(washerData)}
                    </div>
                </div>
                
                <!-- Temperature Section -->
                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Temperature</h4>
                    <div class="flex gap-2">
                        ${this.renderTemperatureOptions(washerData)}
                    </div>
                </div>
                
                <!-- Extra Options Section -->
                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Extra Options</h4>
                    <div class="space-y-2">
                        ${this.renderExtraOptions(washerData)}
                    </div>
                </div>
                
                <!-- Cycle Time Display -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between text-sm">
                        <span style="color: #A6A8AE;">Cycle time:</span>
                        <span class="font-medium" style="color: #36373B;">${washerCycle.cycle.duration}</span>
                    </div>
                </div>
            `;
        }
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
            
            // Update only this washer's display
            this.updateWasherCycleDisplay(washerId);
            this.updateCyclesContinueButton();
        }
    }
},


toggleExtraOption(washerId, optionId) {
    const existingCycles = Cart.getWasherCycles();
    const washerCycle = existingCycles[washerId];
    
    if (washerCycle && washerCycle.cycle) {
        const extraOptions = washerCycle.extraOptions || [];
        const optionIndex = extraOptions.findIndex(e => e.id === optionId);
        
        if (optionIndex > -1) {
            // Remove option (clicking same option again deselects it)
            extraOptions.splice(optionIndex, 1);
        } else {
            // Clear all previous options and add only this one
            extraOptions.length = 0; // Clear array
            const option = washerCycle.cycle.extraOptions.find(o => o.id === optionId);
            if (option) {
                extraOptions.push(option);
            }
        }
        
        washerCycle.extraOptions = extraOptions;
        
        // Recalculate price with extra options
        const basePrice = washerCycle.cycle.price;
        const extraPrice = extraOptions.reduce((sum, opt) => sum + opt.price, 0);
        washerCycle.price = basePrice + extraPrice;
        
        Cart.setWasherCycle(washerId, washerCycle);
        
        // Update display
        this.updateWasherCycleDisplay(washerId);
        this.updateCyclesContinueButton();
    }
},

  /**
   * Select dryers screen initialization
   */
  async initSelectDryersScreen(data) {
    console.log("Init select dryers screen", data);

    // Get machine status from API
    const statusData = await API.getMachineStatus();
    const allDryers = statusData.data.filter((m) => {
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
    const toggle = document.getElementById("show-busy-toggle");
    if (toggle) {
      toggle.addEventListener("change", (e) => {
        this.renderDryers(
          allDryers,
          Cart.getSelectedDryers(),
          e.target.checked
        );
      });
    }

    // Continue button
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
      this.updateDryerContinueButton();
      continueBtn.addEventListener("click", () => {
        if (Cart.getSelectedDryers().length > 0) {
          this.navigateTo("select-dryer-cycles");
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
    
    // Group by pairs (1-2, 3-4, 5-6, 7-8, 9-10)
    const pairs = [
        { ids: [1, 2], label: 'Dryer 1 - 2' },
        { ids: [3, 4], label: 'Dryer 3 - 4' },
        { ids: [5, 6], label: 'Dryer 5 - 6' },
        { ids: [7, 8], label: 'Dryer 7 - 8' },
        { ids: [9, 10], label: 'Dryer 9 - 10' }
    ];
    
    let html = '';
    
    pairs.forEach(pair => {
        const pairDryers = displayDryers.filter(d => pair.ids.includes(d.soda_id));
        
        if (pairDryers.length > 0) {
            html += `
                <div class="mb-4">
                    <div class="px-3 py-2 rounded-lg mb-3" style="background-color: #E8F5FF;">
                        <span class="text-sm font-semibold" style="color: #3B5998;">${pair.label}</span>
                    </div>
                    <div class="space-y-3">
                        ${this.renderDryerCards(pairDryers, selectedDryers)}
                    </div>
                </div>
            `;
        }
    });
    
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
        const isBusy = dryer.statusId === 'IN_USE';
        const location = dryer.soda_id % 2 === 1 ? 'Top' : 'Bottom';
        
        // Card styling
        let cardClass = 'rounded-xl p-4 border transition-all ';
        let cardStyle = '';
        
        if (isBusy) {
            cardClass += 'opacity-50 cursor-not-allowed border-gray-200 bg-white';
        } else if (isSelected) {
            cardClass += 'border-2 cursor-pointer';
            cardStyle = 'border-color: #00BC7D; background-color: #F0FFF9;';
        } else {
            cardClass += 'border-gray-200 cursor-pointer hover:border-blue-300 bg-white';
        }
        
        return `
            <div id="dryer-${dryer.soda_id}" class="${cardClass}" style="${cardStyle}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1">
                        <!-- Green Dot (only for available) -->
                        ${isAvailable && !isBusy ? `
                            <div class="w-2 h-2 rounded-full" style="background-color: #00BC7D;"></div>
                        ` : `
                            <div class="w-2 h-2"></div>
                        `}
                        
                        <!-- Dryer Info -->
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <h3 class="font-semibold" style="color: #36373B;">Dryer ${dryer.soda_id}</h3>
                                <span class="text-sm" style="color: #A6A8AE;">${location}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                ${isAvailable && !isBusy ? `
                                    <span class="text-sm font-medium" style="color: #00BC7D;">Available</span>
                                ` : isBusy ? `
                                    <svg class="w-4 h-4" fill="none" stroke="#FF6B6B" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span class="text-sm font-medium" style="color: #FF6B6B;">Busy (${Utils.formatTime(dryer.remainingSeconds)} left)</span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Selected Icon -->
                    ${isSelected ? `
                        <div class="w-6 h-6 rounded-full flex items-center justify-center ml-3" style="background-color: #3B5998;">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    ` : ''}
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
    API.getMachineStatus().then((statusData) => {
      const allDryers = statusData.data.filter(
        (m) => m.soda_id >= 1 && m.soda_id <= 10
      );
      const toggle = document.getElementById("show-busy-toggle");
      this.renderDryers(
        allDryers,
        Cart.getSelectedDryers(),
        toggle ? toggle.checked : false
      );
      this.updateDryerContinueButton();
    });
  },

  updateDryerContinueButton() {
    const continueBtn = document.getElementById("continue-btn");
    const countSpan = document.getElementById("dryer-count");
    const count = Cart.getSelectedDryers().length;

    if (countSpan) {
      countSpan.textContent = count;
    }

    if (continueBtn) {
      if (count > 0) {
        continueBtn.disabled = false;
        continueBtn.classList.remove("bg-gray-300", "cursor-not-allowed");
        continueBtn.classList.add("bg-blue-600");
      } else {
        continueBtn.disabled = true;
        continueBtn.classList.add("bg-gray-300", "cursor-not-allowed");
        continueBtn.classList.remove("bg-blue-600");
      }
    }
  },

  /**
   * Select dryer cycles screen initialization
   */
  async initSelectDryerCyclesScreen() {
    console.log("Init select dryer cycles screen");

    // Get selected dryers from cart
    const selectedDryerIds = Cart.getSelectedDryers();

    if (selectedDryerIds.length === 0) {
      this.navigateTo("select-dryers");
      return;
    }

    // Get dryer details and cycles
    const dryersWithCycles = selectedDryerIds.map((dryerId) => {
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
          price: cycles[0].durations[1].price,
        };
        Cart.setDryerCycle(dryerId, selectedCycle);
      }

      return {
        dryerId: dryerId,
        cycles: cycles,
        selectedCycle: selectedCycle,
      };
    });

    // Render cycles
    this.renderDryerCycles(dryersWithCycles);

// Continue button
const continueBtn = document.getElementById("continue-btn");
if (continueBtn) {
    // Update button text with total price
    const total = Cart.calculateTotal();
    continueBtn.innerHTML = `Continue • ${Utils.formatPrice(total)}`;
    
    continueBtn.addEventListener("click", () => {
        this.navigateTo("retail-items");
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
                        id="header-btn-${dryer.dryerId}"
                        class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div class="flex items-center gap-2">
                        <span class="dryer-title-${dryer.dryerId} font-bold" style="color: #3B5998;">Dryer ${dryer.dryerId}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-medium" style="color: #A6A8AE;">${dryer.selectedCycle.cycle.name} • ${dryer.selectedCycle.duration.minutes} min</span>
                        <span class="font-semibold" style="color: #36373B;">${Utils.formatPrice(dryer.selectedCycle.price)}</span>
                        <svg id="arrow-${dryer.dryerId}" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </button>
                
                <!-- Accordion Content -->
                <div id="accordion-${dryer.dryerId}" class="accordion-content">
                    <div class="px-4 pb-4">
                        <!-- Heat Settings -->
                        <div class="mt-4">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Heat Setting</h4>
                            <div class="space-y-2">
                                ${this.renderDryerCycleOptions(dryer)}
                            </div>
                        </div>
                        
                        <!-- Drying Time -->
                        <div class="mt-6">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Drying Time</h4>
                            <div class="space-y-2">
                                ${this.renderDryerDurationOptions(dryer)}
                            </div>
                        </div>
                        
                        <!-- Extra Options -->
                        <div class="mt-6">
                            <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Extra Options</h4>
                            <div class="space-y-2">
                                ${this.renderDryerExtraOptions(dryer)}
                            </div>
                        </div>
                        
                        <!-- Cycle Time Display -->
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <div class="flex items-center justify-between text-sm">
                                <span style="color: #A6A8AE;">Cycle time:</span>
                                <span class="font-medium" style="color: #36373B;">${dryer.selectedCycle.duration.minutes} minutes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cyclesList.innerHTML = html;
    
    // Don't open any by default - all collapsed
    this.openAccordions.clear();
},

 renderDryerCycleOptions(dryer) {
    return dryer.cycles.map(cycle => {
        const isSelected = dryer.selectedCycle.cycle.id === cycle.id;
        return `
            <button onclick="App.updateDryerCycleSelection(${dryer.dryerId}, '${cycle.id}')"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="font-medium" style="color: #36373B;">${cycle.name}</span>
            </button>
        `;
    }).join('');
},
renderDryerDurationOptions(dryer) {
    const currentCycle = dryer.cycles.find(c => c.id === dryer.selectedCycle.cycle.id);
    if (!currentCycle) return '';
    
    return currentCycle.durations.map(duration => {
        const isSelected = dryer.selectedCycle.duration.minutes === duration.minutes;
        return `
            <button onclick="App.updateDryerDurationSelection(${dryer.dryerId}, ${duration.minutes})"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="font-medium" style="color: #36373B;">${duration.minutes} minutes</span>
                <span class="font-semibold" style="color: #36373B;">${Utils.formatPrice(duration.price)}</span>
            </button>
        `;
    }).join('');
},

  renderDryerExtraOptions(dryer) {
    if (!dryer.selectedCycle || !dryer.selectedCycle.cycle) {
        return '';
    }
    
    const currentCycle = dryer.cycles.find(c => c.id === dryer.selectedCycle.cycle.id);
    
    if (!currentCycle || !currentCycle.extraOptions) {
        return '';
    }
    
    const selectedExtras = dryer.selectedCycle.extraOptions || [];
    
    return currentCycle.extraOptions.map(option => {
        const isSelected = selectedExtras.some(e => e.id === option.id);
        return `
            <button onclick="App.toggleDryerExtraOption(${dryer.dryerId}, '${option.id}')"
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'border-2' : 'border-gray-200'} hover:border-blue-300"
                    style="${isSelected ? 'border-color: #3B5998; background-color: #F0F7FF;' : 'background-color: white;'}">
                <span class="text-sm font-medium" style="color: #36373B;">${option.name}</span>
                <span class="text-sm font-medium" style="color: #A6A8AE;">+${Utils.formatPrice(option.price)}</span>
            </button>
        `;
    }).join('');
},

toggleDryerExtraOption(dryerId, optionId) {
    const existingCycles = Cart.getDryerCycles();
    const dryerCycle = existingCycles[dryerId];
    
    if (dryerCycle && dryerCycle.cycle) {
        const extraOptions = dryerCycle.extraOptions || [];
        const optionIndex = extraOptions.findIndex(e => e.id === optionId);
        
        if (optionIndex > -1) {
            // Remove option
            extraOptions.splice(optionIndex, 1);
        } else {
            // Clear all and add only this one
            extraOptions.length = 0;
            const option = dryerCycle.cycle.extraOptions.find(o => o.id === optionId);
            if (option) {
                extraOptions.push(option);
            }
        }
        
        dryerCycle.extraOptions = extraOptions;
        
        // Recalculate price
        const basePrice = dryerCycle.duration.price;
        const extraPrice = extraOptions.reduce((sum, opt) => sum + opt.price, 0);
        dryerCycle.price = basePrice + extraPrice;
        
        Cart.setDryerCycle(dryerId, dryerCycle);
        
        // Update display
        this.updateDryerCycleDisplay(dryerId);
        this.updateCyclesContinueButton();
    }
},

 updateDryerCycleSelection(dryerId, cycleId) {
    const cycles = CONFIG.cycles.dryer_cycles;
    const selectedCycle = cycles.find(c => c.id === cycleId);
    
    if (selectedCycle) {
        const cycleData = {
            dryerId: dryerId,
            cycle: selectedCycle,
            duration: selectedCycle.durations[0], // Default to 36 min
            price: selectedCycle.durations[0].price,
            extraOptions: [] // Reset extra options
        };
        
        Cart.setDryerCycle(dryerId, cycleData);
        
        // Update only this dryer
        this.updateDryerCycleDisplay(dryerId);
        this.updateCyclesContinueButton();
    }
},

 updateDryerDurationSelection(dryerId, minutes) {
    const existingCycles = Cart.getDryerCycles();
    const dryerCycle = existingCycles[dryerId];
    
    if (dryerCycle && dryerCycle.cycle && dryerCycle.cycle.durations) {
        const duration = dryerCycle.cycle.durations.find(d => d.minutes === minutes);
        if (duration) {
            dryerCycle.duration = duration;
            
            // Recalculate price with extra options
            const basePrice = duration.price;
            const extraPrice = (dryerCycle.extraOptions || []).reduce((sum, opt) => sum + opt.price, 0);
            dryerCycle.price = basePrice + extraPrice;
            
            Cart.setDryerCycle(dryerId, dryerCycle);
            
            // Update only this dryer
            this.updateDryerCycleDisplay(dryerId);
            this.updateCyclesContinueButton();
        }
    }
},

updateDryerCycleDisplay(dryerId) {
    const cycles = Cart.getDryerCycles();
    const dryerCycle = cycles[dryerId];
    
    if (!dryerCycle) return;
    
    // Update header
    const header = document.getElementById(`header-btn-${dryerId}`);
    if (header) {
        const priceSpan = header.querySelector('span.font-semibold');
        if (priceSpan) {
            priceSpan.textContent = Utils.formatPrice(dryerCycle.price);
        }
        
        // Update cycle/duration text
        const cycleText = header.querySelector('span.text-sm');
        if (cycleText) {
            cycleText.textContent = `${dryerCycle.cycle.name} • ${dryerCycle.duration.minutes} min`;
        }
    }
    
    // Re-render accordion content
    const accordion = document.getElementById(`accordion-${dryerId}`);
    if (accordion) {
        const dryerData = {
            dryerId: dryerId,
            cycles: CONFIG.cycles.dryer_cycles,
            selectedCycle: dryerCycle
        };
        
        const contentDiv = accordion.querySelector('div');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <!-- Heat Settings -->
                <div class="mt-4">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Heat Setting</h4>
                    <div class="space-y-2">
                        ${this.renderDryerCycleOptions(dryerData)}
                    </div>
                </div>
                
                <!-- Drying Time -->
                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Drying Time</h4>
                    <div class="space-y-2">
                        ${this.renderDryerDurationOptions(dryerData)}
                    </div>
                </div>
                
                <!-- Extra Options -->
                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: #36373B;">Extra Options</h4>
                    <div class="space-y-2">
                        ${this.renderDryerExtraOptions(dryerData)}
                    </div>
                </div>
                
                <!-- Cycle Time Display -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between text-sm">
                        <span style="color: #A6A8AE;">Cycle time:</span>
                        <span class="font-medium" style="color: #36373B;">${dryerCycle.duration.minutes} minutes</span>
                    </div>
                </div>
            `;
        }
    }
},

  /**
   * Retail items screen initialization
   */
  async initRetailItemsScreen() {
    console.log("Init retail items screen");

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
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        this.navigateTo("review-cart");
      });
    }
  },

  renderProducts(products, selectedProducts) {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    // Group products by category (you can customize this)
    const washerDetergent = products.filter((p) => p.id <= 3);
    const dryerItems = products.filter((p) => p.id === 4);
    const laundryBags = products.filter((p) => p.id >= 5);

    let html = '<div class="space-y-6">';

    // Washer Detergent Section
    if (washerDetergent.length > 0) {
      html += `
            <div>
                <h3 class="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-3">
                    Washer Detergent
                </h3>
                <div class="space-y-2">
                    ${this.renderProductItems(
                      washerDetergent,
                      selectedProducts
                    )}
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

    html += "</div>";
    productsGrid.innerHTML = html;
  },

  renderProductItems(products, selectedProducts) {
    return products
      .map((product) => {
        const selectedProduct = selectedProducts.find(
          (p) => p.id === product.id
        );
        const quantity = selectedProduct ? selectedProduct.quantity : 0;

        return `
            <div class="bg-white rounded-lg p-4 flex items-center justify-between">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${product.name}</h4>
                    <p class="text-sm font-semibold text-blue-600">${Utils.formatPrice(
                      product.price
                    )}</p>
                </div>
                
                ${
                  quantity > 0
                    ? `
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
                `
                    : `
                    <button onclick="App.addProductById(${product.id})" 
                            class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded">
                        Add
                    </button>
                `
                }
            </div>
        `;
      })
      .join("");
  },
  addProduct(product) {
    Cart.addProduct(product);

    // Re-render products
    API.getProducts().then((productsData) => {
      const products = productsData.products || [];
      const selectedProducts = Cart.getSelectedProducts();
      this.renderProducts(products, selectedProducts);
      this.updateItemCount();
    });
  },
  addProductById(productId) {
    API.getProducts().then((productsData) => {
      const products = productsData.products || [];
      const product = products.find((p) => p.id === productId);

      if (product) {
        this.addProduct(product);
      }
    });
  },

  increaseProductQuantity(productId) {
    const selectedProducts = Cart.getSelectedProducts();
    const product = selectedProducts.find((p) => p.id === productId);

    if (product) {
      Cart.updateProductQuantity(productId, product.quantity + 1);

      // Re-render products
      API.getProducts().then((productsData) => {
        const products = productsData.products || [];
        const selectedProducts = Cart.getSelectedProducts();
        this.renderProducts(products, selectedProducts);
        this.updateItemCount();
      });
    }
  },

  decreaseProductQuantity(productId) {
    const selectedProducts = Cart.getSelectedProducts();
    const product = selectedProducts.find((p) => p.id === productId);

    if (product) {
      Cart.updateProductQuantity(productId, product.quantity - 1);

      // Re-render products
      API.getProducts().then((productsData) => {
        const products = productsData.products || [];
        const selectedProducts = Cart.getSelectedProducts();
        this.renderProducts(products, selectedProducts);
        this.updateItemCount();
      });
    }
  },

  updateItemCount() {
    const countSpan = document.getElementById("item-count");
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
    console.log("Init review cart screen");

    // Get cart summary
    const cartSummary = Cart.getCartSummary();

    // Check if cart is empty
    if (cartSummary.washers.length === 0 && cartSummary.dryers.length === 0) {
      Utils.showToast("Your cart is empty", "error");
      this.navigateTo("welcome");
      return;
    }

    // Render cart items
    this.renderCartSummary(cartSummary);

    // Payment button
    const paymentBtn = document.getElementById("payment-btn");
    if (paymentBtn) {
      paymentBtn.addEventListener("click", () => {
        this.navigateTo("payment-mock");
      });
    }
  },

renderCartSummary(cartSummary) {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;
    
    let html = '';
    let machinesTotal = 0;
    let retailTotal = 0;
    
    // Calculate machine totals first
    cartSummary.washers.forEach(washerId => {
        const cycle = cartSummary.washerCycles[washerId];
        if (cycle) machinesTotal += cycle.price;
    });
    
    cartSummary.dryers.forEach(dryerId => {
        const cycle = cartSummary.dryerCycles[dryerId];
        if (cycle) machinesTotal += cycle.price;
    });
    
    // Determine section title based on what's in cart
    let machinesSectionTitle = '';
    let machinesEditTarget = '';
    
    if (cartSummary.washers.length > 0 && cartSummary.dryers.length === 0) {
        machinesSectionTitle = 'Washers';
        machinesEditTarget = 'select-washers';
    } else if (cartSummary.dryers.length > 0 && cartSummary.washers.length === 0) {
        machinesSectionTitle = 'Dryers';
        machinesEditTarget = 'select-dryers';
    } else if (cartSummary.washers.length > 0 && cartSummary.dryers.length > 0) {
        machinesSectionTitle = 'Washers & Dryers';
        machinesEditTarget = 'select-washers';
    }
    
    // Render Machines Section (Washers and/or Dryers)
    if (cartSummary.washers.length > 0 || cartSummary.dryers.length > 0) {
        let machinesHTML = '';
        
        // Add washers
        cartSummary.washers.forEach(washerId => {
            const cycle = cartSummary.washerCycles[washerId];
            const machineInfo = getMachineType(washerId);
            
            if (cycle && machineInfo) {
                machinesHTML += `
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold" style="color: #36373B;">Washer ${washerId}</h4>
                            <span class="font-semibold" style="color: #3B5998;">${Utils.formatPrice(cycle.price)}</span>
                        </div>
                        <p class="text-sm" style="color: #A6A8AE;">${cycle.cycle.name} • ${cycle.temperature.name} • ${cycle.cycle.duration}</p>
                    </div>
                `;
            }
        });
        
        // Add dryers
        cartSummary.dryers.forEach(dryerId => {
            const cycle = cartSummary.dryerCycles[dryerId];
            
            if (cycle) {
                machinesHTML += `
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold" style="color: #36373B;">Dryer ${dryerId}</h4>
                            <span class="font-semibold" style="color: #3B5998;">${Utils.formatPrice(cycle.price)}</span>
                        </div>
                        <p class="text-sm" style="color: #A6A8AE;">${cycle.cycle.name} • ${cycle.duration.minutes} min</p>
                    </div>
                `;
            }
        });
        
        html += `
            <div class="bg-white rounded-xl p-4">
                <!-- Section Header -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b" style="border-color: #3B5998;">
                    <h3 class="font-semibold" style="color: #3B5998;">${machinesSectionTitle}</h3>
                    <button onclick="App.navigateTo('${machinesEditTarget}')" class="flex items-center gap-1 text-sm" style="color: #3B5998;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit
                    </button>
                </div>
                
                <!-- Machines List -->
                ${machinesHTML}
                
                <!-- Machines Subtotal -->
                <div class="pt-3 border-t border-gray-200 mt-4">
                    <div class="flex items-center justify-between">
                        <span class="font-medium" style="color: #36373B;">Machines Subtotal</span>
                        <span class="font-bold" style="color: #36373B;">${Utils.formatPrice(machinesTotal)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Retail Products Section
    if (cartSummary.products.length > 0) {
        let productsHTML = '';
        
        cartSummary.products.forEach(product => {
            retailTotal += product.price * product.quantity;
            
            productsHTML += `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold" style="color: #36373B;">${product.name}</h4>
                        <span class="font-semibold" style="color: #3B5998;">${Utils.formatPrice(product.price * product.quantity)}</span>
                    </div>
                    <p class="text-sm" style="color: #A6A8AE;">Qty: ${product.quantity}</p>
                </div>
            `;
        });
        
        html += `
            <div class="bg-white rounded-xl p-4">
                <!-- Section Header -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b" style="border-color: #3B5998;">
                    <h3 class="font-semibold" style="color: #3B5998;">Retail Items</h3>
                    <button onclick="App.navigateTo('retail-items')" class="flex items-center gap-1 text-sm" style="color: #3B5998;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit
                    </button>
                </div>
                
                <!-- Products List -->
                ${productsHTML}
                
                <!-- Retail Subtotal -->
                <div class="pt-3 border-t border-gray-200 mt-4">
                    <div class="flex items-center justify-between">
                        <span class="font-medium" style="color: #36373B;">Retail Subtotal</span>
                        <span class="font-bold" style="color: #36373B;">${Utils.formatPrice(retailTotal)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    cartItems.innerHTML = html;
    cartTotal.textContent = Utils.formatPrice(cartSummary.total);
},
  renderWasherItems(washerIds, washerCycles) {
    return washerIds
      .map((washerId) => {
        const cycle = washerCycles[washerId];
        const machineInfo = getMachineType(washerId);

        if (!machineInfo) {
          return "";
        }

        const sizeLabel =
          machineInfo.machine.category === "S"
            ? "Small (20 lbs)"
            : machineInfo.machine.category === "M"
            ? "Medium (40 lbs)"
            : "Large (60 lbs)";

        // If no cycle configured, show with default price
        if (!cycle || !cycle.cycle || !cycle.temperature) {
          const defaultCycles = getCyclesForMachine(
            machineInfo.machine.category
          );
          const defaultPrice =
            defaultCycles && defaultCycles[0] ? defaultCycles[0].price : 0;

          return `
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                        <div class="font-medium text-gray-900">Washer #${washerId}</div>
                        <div class="text-sm text-gray-500">${sizeLabel} • Not configured</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-gray-900">${Utils.formatPrice(
                          defaultPrice
                        )}</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-medium text-gray-900">Washer #${washerId}</div>
                    <div class="text-sm text-gray-500">${sizeLabel} • ${
          cycle.cycle.name
        } • ${cycle.temperature.name}</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(
                      cycle.price
                    )}</div>
                </div>
            </div>
        `;
      })
      .join("");
  },

  renderDryerItems(dryerIds, dryerCycles) {
    return dryerIds
      .map((dryerId) => {
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
                    <div class="text-sm text-gray-500">${cycle.cycle.name} • ${
          cycle.duration
        } min</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(
                      cycle.price
                    )}</div>
                </div>
            </div>
        `;
      })
      .join("");
  },

  renderCartProductItems(products) {
    return products
      .map((product) => {
        return `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">Qty: ${
                      product.quantity
                    }</div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-gray-900">${Utils.formatPrice(
                      product.price * product.quantity
                    )}</div>
                </div>
            </div>
        `;
      })
      .join("");
  },

  /**
   * Payment mock screen initialization
   */
  initPaymentMockScreen() {
    console.log("Init payment mock screen");

    const successBtn = document.getElementById("success-btn");
    const failureBtn = document.getElementById("failure-btn");

    if (successBtn) {
      successBtn.addEventListener("click", async () => {
        // Simulate payment processing
        const cartSummary = Cart.getCartSummary();
        const result = await API.processPayment(cartSummary);

        if (result.success) {
          // Create order in CleanCloud
          await API.createOrder(cartSummary);

          // Start machines
          const machines = cartSummary.washers.map((wId) => ({
            machineId: wId,
            cycle: cartSummary.washerCycles[wId],
          }));
          await API.startMachines(machines);

          // Navigate to success screen
          this.navigateTo("payment-success");
        }
      });
    }

    if (failureBtn) {
      failureBtn.addEventListener("click", () => {
        Utils.showToast("Payment failed. Please try again.", "error");
        this.navigateTo("review-cart");
      });
    }
  },
  /**
   * Payment success screen initialization
   */
  async initPaymentSuccessScreen() {
    console.log("Init payment success screen");

    // Get cart summary before clearing
    const cartSummary = Cart.getCartSummary();

    // Render order summary
    this.renderOrderSummary(cartSummary);

    // New transaction button
    const newTransactionBtn = document.getElementById("new-transaction-btn");
    if (newTransactionBtn) {
      newTransactionBtn.addEventListener("click", () => {
        // Clear cart and start fresh
        Cart.clear();
        this.openAccordions.clear();
        this.navigateTo("welcome");
      });
    }
  },

  renderOrderSummary(cartSummary) {
    const orderSummary = document.getElementById("order-summary");
    const totalPaid = document.getElementById("total-paid");

    if (!orderSummary || !totalPaid) return;

    let html = "";

    // Washers
    if (cartSummary.washers.length > 0) {
      cartSummary.washers.forEach((washerId) => {
        const cycle = cartSummary.washerCycles[washerId];
        const machineInfo = getMachineType(washerId);
        const sizeLabel =
          machineInfo.machine.category === "S"
            ? "Small"
            : machineInfo.machine.category === "M"
            ? "Medium"
            : "Large";

        if (cycle) {
          html += `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">Washer #${washerId} (${sizeLabel})</span>
                        <span class="font-semibold text-gray-900">${Utils.formatPrice(
                          cycle.price
                        )}</span>
                    </div>
                `;
        }
      });
    }

    // Dryers
    if (cartSummary.dryers.length > 0) {
      cartSummary.dryers.forEach((dryerId) => {
        const cycle = cartSummary.dryerCycles[dryerId];

        if (cycle) {
          html += `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700">Dryer #${dryerId}</span>
                        <span class="font-semibold text-gray-900">${Utils.formatPrice(
                          cycle.price
                        )}</span>
                    </div>
                `;
        }
      });
    }

    // Retail Products
    if (cartSummary.products.length > 0) {
      cartSummary.products.forEach((product) => {
        html += `
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">${product.name} (x${
          product.quantity
        })</span>
                    <span class="font-semibold text-gray-900">${Utils.formatPrice(
                      product.price * product.quantity
                    )}</span>
                </div>
            `;
      });
    }

    orderSummary.innerHTML = html;
    totalPaid.textContent = Utils.formatPrice(cartSummary.total);
  },
};

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});




