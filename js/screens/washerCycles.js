// js/screens/washerCycles.js
const WasherCyclesScreen = {
    accordionTemplate: null,
    cycleButtonTemplate: null,
    temperatureButtonTemplate: null,
    extraOptionButtonTemplate: null,

    async init() {
        // Load all templates
        if (!this.accordionTemplate) {
            const responses = await Promise.all([
                fetch('templates/washer-cycle-accordion.html'),
                fetch('templates/cycle-option-button.html'),
                fetch('templates/temperature-button.html'),
                fetch('templates/extra-option-button.html')
            ]);
            
            [
                this.accordionTemplate,
                this.cycleButtonTemplate,
                this.temperatureButtonTemplate,
                this.extraOptionButtonTemplate
            ] = await Promise.all(responses.map(r => r.text()));
        }

        const selectedWasherIds = Cart.getSelectedWashers();

        if (selectedWasherIds.length === 0) {
            App.navigateTo('select-washers');
            return;
        }

        // Prepare washer data
        const washersWithCycles = selectedWasherIds.map((washerId) => {
            const machineInfo = getMachineType(washerId);
            const cycles = getCyclesForMachine(machineInfo.machine.category);

            const existingCycles = Cart.getWasherCycles();
            let selectedCycle = existingCycles[washerId];

            if (!selectedCycle) {
                selectedCycle = {
                    washerId: washerId,
                    cycle: cycles[0],
                    temperature: cycles[0].temperatures[0],
                    price: cycles[0].price,
                };
                Cart.setWasherCycle(washerId, selectedCycle);
            }

            return {
                washerId: washerId,
                category: machineInfo.machine.category,
                size: machineInfo.machine.size,
                cycles: cycles,
                selectedCycle: selectedCycle,
            };
        });

        this.renderWasherCycles(washersWithCycles);
        this.attachEventListeners();
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
                    <button class="washer-header w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
                            data-washer-id="${washer.washerId}">
                        <div class="flex items-center gap-2">
                            <span class="washer-title font-bold" style="color: #36373B;">Washer ${washer.washerId} ${sizeLabel}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="washer-price font-semibold" style="color: #36373B;">${Utils.formatPrice(washer.selectedCycle.price)}</span>
                            <svg class="accordion-arrow w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>

                    <!-- Accordion Content -->
                    <div class="accordion-content" data-washer-id="${washer.washerId}">
                        <div class="px-4 pb-4">
                            ${this.renderAccordionContent(washer)}
                        </div>
                    </div>
                </div>
            `;
        });

        cyclesList.innerHTML = html;
    },

    renderAccordionContent(washer) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.accordionTemplate, 'text/html');
        const content = doc.querySelector('.accordion-content-wrapper');

        // Populate cycle options
        content.querySelector('.cycle-options-container').innerHTML = 
            this.renderCycleOptions(washer, washer.cycles.slice(0, 1));

        // Populate other cycles
        content.querySelector('.other-cycles-container').innerHTML = 
            this.renderCycleOptions(washer, washer.cycles.slice(1));

        // Populate temperatures
        const currentCycle = washer.cycles.find(c => c.id === washer.selectedCycle.cycle.id);
        if (currentCycle) {
            content.querySelector('.temperature-container').innerHTML = 
                this.renderTemperatureOptions(washer, currentCycle.temperatures);
        }

        // Populate extra options
        if (currentCycle && currentCycle.extraOptions) {
            content.querySelector('.extra-options-container').innerHTML = 
                this.renderExtraOptions(washer, currentCycle.extraOptions);
        }

        // Set cycle time
        content.querySelector('.cycle-duration').textContent = washer.selectedCycle.cycle.duration;

        return content.outerHTML;
    },

    renderCycleOptions(washer, cycles) {
        return cycles.map(cycle => {
            const isSelected = washer.selectedCycle.cycle.id === cycle.id;
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.cycleButtonTemplate, 'text/html');
            const btn = doc.querySelector('.cycle-option-btn');

            btn.setAttribute('data-cycle-id', cycle.id);
            btn.setAttribute('data-washer-id', washer.washerId);

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#F0F7FF';
            }

            btn.querySelector('.cycle-name').textContent = cycle.name;
            btn.querySelector('.cycle-details').textContent = 
                `${Utils.formatPrice(cycle.price)} • ${cycle.duration}`;

            return btn.outerHTML;
        }).join('');
    },

    renderTemperatureOptions(washer, temperatures) {
        return temperatures.map(temp => {
            const isSelected = washer.selectedCycle.temperature.id === temp.id;
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.temperatureButtonTemplate, 'text/html');
            const btn = doc.querySelector('.temperature-btn');

            btn.setAttribute('data-temperature-id', temp.id);
            btn.setAttribute('data-washer-id', washer.washerId);
            btn.textContent = temp.name;

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#E8F5FF';
                btn.style.color = '#3B5998';
            }

            return btn.outerHTML;
        }).join('');
    },

    renderExtraOptions(washer, extraOptions) {
        const selectedExtras = washer.selectedCycle.extraOptions || [];

        return extraOptions.map(option => {
            const isSelected = selectedExtras.some(e => e.id === option.id);
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.extraOptionButtonTemplate, 'text/html');
            const btn = doc.querySelector('.extra-option-btn');

            btn.setAttribute('data-option-id', option.id);
            btn.setAttribute('data-washer-id', washer.washerId);

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#F0F7FF';
            }

            btn.querySelector('.option-name').textContent = option.name;
            btn.querySelector('.option-details').textContent = 
                `+${Utils.formatPrice(option.price)} • +${option.duration} min`;

            return btn.outerHTML;
        }).join('');
    },

    attachEventListeners() {
        // Accordion toggles
        document.querySelectorAll('.washer-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const washerId = parseInt(header.getAttribute('data-washer-id'));
                this.toggleAccordion(washerId);
            });
        });

        // Cycle selection
        document.addEventListener('click', (e) => {
            const cycleBtn = e.target.closest('.cycle-option-btn');
            if (cycleBtn) {
                const washerId = parseInt(cycleBtn.getAttribute('data-washer-id'));
                const cycleId = cycleBtn.getAttribute('data-cycle-id');
                this.updateCycleSelection(washerId, cycleId);
            }

            const tempBtn = e.target.closest('.temperature-btn');
            if (tempBtn) {
                const washerId = parseInt(tempBtn.getAttribute('data-washer-id'));
                const tempId = tempBtn.getAttribute('data-temperature-id');
                this.updateTemperatureSelection(washerId, tempId);
            }

            const extraBtn = e.target.closest('.extra-option-btn');
            if (extraBtn) {
                const washerId = parseInt(extraBtn.getAttribute('data-washer-id'));
                const optionId = extraBtn.getAttribute('data-option-id');
                this.toggleExtraOption(washerId, optionId);
            }
        });

        // Continue button
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            this.updateContinueButton();
            continueBtn.addEventListener('click', () => {
                App.navigateTo('retail-items');
            });
        }
    },

    toggleAccordion(washerId) {
        const accordion = document.querySelector(`.accordion-content[data-washer-id="${washerId}"]`);
        const header = document.querySelector(`.washer-header[data-washer-id="${washerId}"]`);
        const arrow = header.querySelector('.accordion-arrow');
        const title = header.querySelector('.washer-title');

        if (accordion && arrow) {
            const isOpening = !accordion.classList.contains('open');

            accordion.classList.toggle('open');
            arrow.style.transform = accordion.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';

            if (title) {
                title.style.color = isOpening ? '#3B5998' : '#36373B';
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
                extraOptions: []
            };

            Cart.setWasherCycle(washerId, cycleData);
            this.updateWasherDisplay(washerId);
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
                this.updateWasherDisplay(washerId);
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
                extraOptions.splice(optionIndex, 1);
            } else {
                extraOptions.length = 0;
                const option = washerCycle.cycle.extraOptions.find(o => o.id === optionId);
                if (option) {
                    extraOptions.push(option);
                }
            }

            washerCycle.extraOptions = extraOptions;

            const basePrice = washerCycle.cycle.price;
            const extraPrice = extraOptions.reduce((sum, opt) => sum + opt.price, 0);
            washerCycle.price = basePrice + extraPrice;

            Cart.setWasherCycle(washerId, washerCycle);
            this.updateWasherDisplay(washerId);
        }
    },

    updateWasherDisplay(washerId) {
        const cycles = Cart.getWasherCycles();
        const washerCycle = cycles[washerId];

        if (!washerCycle) return;

        // Update header price
        const header = document.querySelector(`.washer-header[data-washer-id="${washerId}"]`);
        if (header) {
            const priceSpan = header.querySelector('.washer-price');
            if (priceSpan) {
                priceSpan.textContent = Utils.formatPrice(washerCycle.price);
            }
        }

        // Re-render accordion content
        const accordion = document.querySelector(`.accordion-content[data-washer-id="${washerId}"]`);
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

            const contentDiv = accordion.querySelector('div');
            if (contentDiv) {
                contentDiv.innerHTML = this.renderAccordionContent(washerData);
            }
        }

        this.updateContinueButton();
    },

    updateContinueButton() {
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            const total = Cart.calculateTotal();
            continueBtn.innerHTML = `Continue • ${Utils.formatPrice(total)}`;
        }
    }
};