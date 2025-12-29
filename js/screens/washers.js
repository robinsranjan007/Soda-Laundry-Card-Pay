// js/screens/washers.js
const WashersScreen = {
    washerCardTemplate: null,

    async init(data) {
        // Load template once
        if (!this.washerCardTemplate) {
            const response = await fetch('templates/washer-card.html');
            this.washerCardTemplate = await response.text();
        }

        // Get machine status from API
        const statusData = await API.getMachineStatus();
        const allWashers = statusData.data.filter((m) => m.soda_id >= 21 && m.soda_id <= 63);

        let selectedWashers = Cart.getSelectedWashers();

        // If preselected machine
        if (data.preselected) {
            const machineId = parseInt(data.preselected);
            if (!selectedWashers.includes(machineId)) {
                selectedWashers.push(machineId);
                Cart.setSelectedWashers(selectedWashers);
            }
        }

        this.renderWashers(allWashers, selectedWashers);
        this.attachEventListeners(allWashers);
    },

    renderWashers(washers, selectedWashers, showBusy = false) {
        const washersList = document.getElementById('washers-list');
        if (!washersList) return;

        // Filter
        let displayWashers = showBusy ? washers : washers.filter(
            (w) => w.statusId === "AVAILABLE" || selectedWashers.includes(w.soda_id)
        );

        // Group by size
        const largeWashers = displayWashers.filter((w) => w.soda_id >= 61 && w.soda_id <= 63);
        const mediumWashers = displayWashers.filter((w) => w.soda_id >= 41 && w.soda_id <= 44);
        const smallWashers = displayWashers.filter((w) => w.soda_id >= 21 && w.soda_id <= 24);

        let html = '';

        // Large washers
        if (largeWashers.length > 0) {
            html += this.renderWasherGroup('XL', largeWashers, selectedWashers);
        }
        if (mediumWashers.length > 0) {
            html += this.renderWasherGroup('L', mediumWashers, selectedWashers);
        }
        if (smallWashers.length > 0) {
            html += this.renderWasherGroup('M', smallWashers, selectedWashers);
        }

        washersList.innerHTML = html;

        // Add click handlers AFTER rendering
        displayWashers.forEach((washer) => {
            const card = document.getElementById(`washer-${washer.soda_id}`);
            if (card && washer.statusId === "AVAILABLE") {
                card.addEventListener("click", () => {
                    this.toggleSelection(washer.soda_id);
                });
            }
        });
    },

    renderWasherGroup(sizeLabel, washers, selectedWashers) {
        return `
            <div class="mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" 
                         style="background-color: #E8F5FF; color: #3B5998;">
                        ${sizeLabel}
                    </div>
                </div>
                <div class="space-y-3">
                    ${washers.map(w => this.createWasherCard(w, selectedWashers)).join('')}
                </div>
            </div>
        `;
    },

    createWasherCard(washer, selectedWashers) {
        const isSelected = selectedWashers.includes(washer.soda_id);
        const isAvailable = washer.statusId === "AVAILABLE";
        const isBusy = washer.statusId === "IN_USE";

        // Clone template
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.washerCardTemplate, 'text/html');
        const card = doc.querySelector('.washer-card');

        // Set data attribute and ID
        card.setAttribute('data-washer-id', washer.soda_id);
        card.setAttribute('id', `washer-${washer.soda_id}`);

        // Apply styling based on status
        if (isBusy) {
            card.classList.add('opacity-50', 'cursor-not-allowed', 'border-gray-200', 'bg-white');
        } else if (isSelected) {
            card.classList.add('border-2', 'cursor-pointer');
            card.style.borderColor = '#00BC7D';
            card.style.backgroundColor = '#F0FFF9';
        } else {
            card.classList.add('border-gray-200', 'cursor-pointer', 'hover:border-blue-300', 'bg-white');
        }

        // Populate data
        card.querySelector('.washer-title').textContent = `Washer ${washer.soda_id}`;
        card.querySelector('.washer-price').textContent = Utils.formatPrice(washer.remainingVend);

        // Status dot
        const statusDot = card.querySelector('.status-dot');
        if (isAvailable && !isBusy) {
            statusDot.style.backgroundColor = '#00BC7D';
        } else {
            statusDot.style.display = 'none';
        }

        // Status text
        const statusText = card.querySelector('.status-text');
        if (isAvailable && !isBusy) {
            statusText.textContent = 'Available';
            statusText.style.color = '#00BC7D';
        } else if (isBusy) {
            statusText.innerHTML = `
                <svg class="w-4 h-4 inline" fill="none" stroke="#FF6B6B" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Busy (${Utils.formatTime(washer.remainingSeconds)} left)
            `;
            statusText.style.color = '#FF6B6B';
        }

        // Selected icon
        if (isSelected) {
            card.querySelector('.selected-icon').classList.remove('hidden');
            card.querySelector('.selected-icon').classList.add('flex');
        }

        return card.outerHTML;
    },

    toggleSelection(washerId) {
        const selectedWashers = Cart.getSelectedWashers();

        if (selectedWashers.includes(washerId)) {
            Cart.removeWasher(washerId);
        } else {
            Cart.addWasher(washerId);
        }

        // Re-render
        API.getMachineStatus().then((statusData) => {
            const allWashers = statusData.data.filter((m) => m.soda_id >= 21 && m.soda_id <= 63);
            const toggle = document.getElementById('show-busy-toggle');
            this.renderWashers(allWashers, Cart.getSelectedWashers(), toggle ? toggle.checked : false);
            this.updateContinueButton();
        });
    },

    attachEventListeners(washers) {
        const toggle = document.getElementById('show-busy-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                API.getMachineStatus().then((statusData) => {
                    const allWashers = statusData.data.filter((m) => m.soda_id >= 21 && m.soda_id <= 63);
                    this.renderWashers(allWashers, Cart.getSelectedWashers(), e.target.checked);
                });
            });
        }

        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            this.updateContinueButton();
            continueBtn.addEventListener('click', () => {
                if (Cart.getSelectedWashers().length > 0) {
                    App.navigateTo('select-washer-cycles');
                }
            });
        }
    },

    updateContinueButton() {
        const continueBtn = document.getElementById('continue-btn');
        const countSpan = document.getElementById('washer-count');
        const count = Cart.getSelectedWashers().length;

        if (countSpan) countSpan.textContent = count;

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
    }
};