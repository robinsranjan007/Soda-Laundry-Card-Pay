// js/screens/dryerCycles.js
const DryerCyclesScreen = {
    accordionTemplate: null,
    cycleButtonTemplate: null,
    durationButtonTemplate: null,
    extraOptionButtonTemplate: null,

    async init() {
        // Load templates
        if (!this.accordionTemplate) {
            const responses = await Promise.all([
                fetch('templates/dryer-cycle-accordion.html'),
                fetch('templates/cycle-option-button.html'),
                fetch('templates/dryer-duration-button.html'),
                fetch('templates/extra-option-button.html')
            ]);
            
            [
                this.accordionTemplate,
                this.cycleButtonTemplate,
                this.durationButtonTemplate,
                this.extraOptionButtonTemplate
            ] = await Promise.all(responses.map(r => r.text()));
        }

        const selectedDryerIds = Cart.getSelectedDryers();

        if (selectedDryerIds.length === 0) {
            App.navigateTo('select-dryers');
            return;
        }

        const dryersWithCycles = selectedDryerIds.map((dryerId) => {
            const cycles = CONFIG.cycles.dryer_cycles;
            const existingCycles = Cart.getDryerCycles();
            let selectedCycle = existingCycles[dryerId];

            if (!selectedCycle) {
                selectedCycle = {
                    dryerId: dryerId,
                    cycle: cycles[0],
                    duration: cycles[0].durations[1],
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

        this.renderDryerCycles(dryersWithCycles);
        this.attachEventListeners();
    },

    renderDryerCycles(dryersWithCycles) {
        const cyclesList = document.getElementById('dryer-cycles-list');
        if (!cyclesList) return;

        let html = '';

        dryersWithCycles.forEach((dryer) => {
            html += `
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <!-- Dryer Header -->
                    <button class="dryer-header w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
                            data-dryer-id="${dryer.dryerId}">
                        <div class="flex items-center gap-2">
                            <span class="dryer-title font-bold" style="color: #3B5998;">Dryer ${dryer.dryerId}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-medium" style="color: #A6A8AE;">${dryer.selectedCycle.cycle.name} • ${dryer.selectedCycle.duration.minutes} min</span>
                            <span class="dryer-price font-semibold" style="color: #36373B;">${Utils.formatPrice(dryer.selectedCycle.price)}</span>
                            <svg class="accordion-arrow w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>

                    <!-- Accordion Content -->
                    <div class="accordion-content" data-dryer-id="${dryer.dryerId}">
                        <div class="px-4 pb-4">
                            ${this.renderAccordionContent(dryer)}
                        </div>
                    </div>
                </div>
            `;
        });

        cyclesList.innerHTML = html;
    },

    renderAccordionContent(dryer) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.accordionTemplate, 'text/html');
        const content = doc.querySelector('.accordion-content-wrapper');

        // Populate heat settings
        content.querySelector('.heat-settings-container').innerHTML = 
            this.renderHeatSettings(dryer);

        // Populate drying time
        const currentCycle = dryer.cycles.find(c => c.id === dryer.selectedCycle.cycle.id);
        if (currentCycle) {
            content.querySelector('.drying-time-container').innerHTML = 
                this.renderDryingTime(dryer, currentCycle.durations);
        }

        // Populate extra options
        if (currentCycle && currentCycle.extraOptions) {
            content.querySelector('.extra-options-container').innerHTML = 
                this.renderExtraOptions(dryer, currentCycle.extraOptions);
        } else {
            content.querySelector('.extra-options-container').innerHTML = '';
        }

        // Set cycle time
        content.querySelector('.cycle-duration').textContent = 
            `${dryer.selectedCycle.duration.minutes} minutes`;

        return content.outerHTML;
    },

    renderHeatSettings(dryer) {
        return dryer.cycles.map(cycle => {
            const isSelected = dryer.selectedCycle.cycle.id === cycle.id;
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.cycleButtonTemplate, 'text/html');
            const btn = doc.querySelector('.cycle-option-btn');

            btn.setAttribute('data-cycle-id', cycle.id);
            btn.setAttribute('data-dryer-id', dryer.dryerId);

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#F0F7FF';
            }

            btn.querySelector('.cycle-name').textContent = cycle.name;
            btn.querySelector('.cycle-details').remove(); // Heat settings don't show details

            return btn.outerHTML;
        }).join('');
    },

    renderDryingTime(dryer, durations) {
        return durations.map(duration => {
            const isSelected = dryer.selectedCycle.duration.minutes === duration.minutes;
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.durationButtonTemplate, 'text/html');
            const btn = doc.querySelector('.duration-btn');

            btn.setAttribute('data-duration', duration.minutes);
            btn.setAttribute('data-dryer-id', dryer.dryerId);

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#F0F7FF';
            }

            btn.querySelector('.duration-text').textContent = `${duration.minutes} minutes`;
            btn.querySelector('.duration-price').textContent = Utils.formatPrice(duration.price);

            return btn.outerHTML;
        }).join('');
    },

    renderExtraOptions(dryer, extraOptions) {
        const selectedExtras = dryer.selectedCycle.extraOptions || [];

        return extraOptions.map(option => {
            const isSelected = selectedExtras.some(e => e.id === option.id);
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.extraOptionButtonTemplate, 'text/html');
            const btn = doc.querySelector('.extra-option-btn');

            btn.setAttribute('data-option-id', option.id);
            btn.setAttribute('data-dryer-id', dryer.dryerId);

            if (isSelected) {
                btn.classList.remove('border-gray-200');
                btn.classList.add('border-2');
                btn.style.borderColor = '#3B5998';
                btn.style.backgroundColor = '#F0F7FF';
            }

            btn.querySelector('.option-name').textContent = option.name;
            btn.querySelector('.option-details').textContent = 
                `+${Utils.formatPrice(option.price)}`;

            return btn.outerHTML;
        }).join('');
    },

    attachEventListeners() {
        // Accordion toggles
        document.querySelectorAll('.dryer-header').forEach(header => {
            header.addEventListener('click', () => {
                const dryerId = parseInt(header.getAttribute('data-dryer-id'));
                this.toggleAccordion(dryerId);
            });
        });

        // Event delegation for all buttons
        document.addEventListener('click', (e) => {
            const cycleBtn = e.target.closest('.cycle-option-btn');
            if (cycleBtn) {
                const dryerId = parseInt(cycleBtn.getAttribute('data-dryer-id'));
                const cycleId = cycleBtn.getAttribute('data-cycle-id');
                this.updateCycleSelection(dryerId, cycleId);
            }

            const durationBtn = e.target.closest('.duration-btn');
            if (durationBtn) {
                const dryerId = parseInt(durationBtn.getAttribute('data-dryer-id'));
                const minutes = parseInt(durationBtn.getAttribute('data-duration'));
                this.updateDurationSelection(dryerId, minutes);
            }

            const extraBtn = e.target.closest('.extra-option-btn');
            if (extraBtn) {
                const dryerId = parseInt(extraBtn.getAttribute('data-dryer-id'));
                const optionId = extraBtn.getAttribute('data-option-id');
                this.toggleExtraOption(dryerId, optionId);
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

    toggleAccordion(dryerId) {
        const accordion = document.querySelector(`.accordion-content[data-dryer-id="${dryerId}"]`);
        const header = document.querySelector(`.dryer-header[data-dryer-id="${dryerId}"]`);
        const arrow = header.querySelector('.accordion-arrow');
        const title = header.querySelector('.dryer-title');

        if (accordion && arrow) {
            const isOpening = !accordion.classList.contains('open');

            accordion.classList.toggle('open');
            arrow.style.transform = accordion.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';

            if (title) {
                title.style.color = isOpening ? '#3B5998' : '#36373B';
            }
        }
    },

    updateCycleSelection(dryerId, cycleId) {
        const cycles = CONFIG.cycles.dryer_cycles;
        const selectedCycle = cycles.find(c => c.id === cycleId);

        if (selectedCycle) {
            const cycleData = {
                dryerId: dryerId,
                cycle: selectedCycle,
                duration: selectedCycle.durations[0],
                price: selectedCycle.durations[0].price,
                extraOptions: []
            };

            Cart.setDryerCycle(dryerId, cycleData);
            this.updateDryerDisplay(dryerId);
        }
    },

    updateDurationSelection(dryerId, minutes) {
        const existingCycles = Cart.getDryerCycles();
        const dryerCycle = existingCycles[dryerId];

        if (dryerCycle && dryerCycle.cycle && dryerCycle.cycle.durations) {
            const duration = dryerCycle.cycle.durations.find(d => d.minutes === minutes);
            if (duration) {
                dryerCycle.duration = duration;

                const basePrice = duration.price;
                const extraPrice = (dryerCycle.extraOptions || []).reduce((sum, opt) => sum + opt.price, 0);
                dryerCycle.price = basePrice + extraPrice;

                Cart.setDryerCycle(dryerId, dryerCycle);
                this.updateDryerDisplay(dryerId);
            }
        }
    },

    toggleExtraOption(dryerId, optionId) {
        const existingCycles = Cart.getDryerCycles();
        const dryerCycle = existingCycles[dryerId];

        if (dryerCycle && dryerCycle.cycle) {
            const extraOptions = dryerCycle.extraOptions || [];
            const optionIndex = extraOptions.findIndex(e => e.id === optionId);

            if (optionIndex > -1) {
                extraOptions.splice(optionIndex, 1);
            } else {
                extraOptions.length = 0;
                const option = dryerCycle.cycle.extraOptions.find(o => o.id === optionId);
                if (option) {
                    extraOptions.push(option);
                }
            }

            dryerCycle.extraOptions = extraOptions;

            const basePrice = dryerCycle.duration.price;
            const extraPrice = extraOptions.reduce((sum, opt) => sum + opt.price, 0);
            dryerCycle.price = basePrice + extraPrice;

            Cart.setDryerCycle(dryerId, dryerCycle);
            this.updateDryerDisplay(dryerId);
        }
    },

    updateDryerDisplay(dryerId) {
        const cycles = Cart.getDryerCycles();
        const dryerCycle = cycles[dryerId];

        if (!dryerCycle) return;

        // Update header
        const header = document.querySelector(`.dryer-header[data-dryer-id="${dryerId}"]`);
        if (header) {
            const priceSpan = header.querySelector('.dryer-price');
            if (priceSpan) {
                priceSpan.textContent = Utils.formatPrice(dryerCycle.price);
            }

            const cycleText = header.querySelector('span.text-sm');
            if (cycleText) {
                cycleText.textContent = `${dryerCycle.cycle.name} • ${dryerCycle.duration.minutes} min`;
            }
        }

        // Re-render accordion content
        const accordion = document.querySelector(`.accordion-content[data-dryer-id="${dryerId}"]`);
        if (accordion) {
            const dryerData = {
                dryerId: dryerId,
                cycles: CONFIG.cycles.dryer_cycles,
                selectedCycle: dryerCycle
            };

            const contentDiv = accordion.querySelector('div');
            if (contentDiv) {
                contentDiv.innerHTML = this.renderAccordionContent(dryerData);
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