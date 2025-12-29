// js/screens/dryers.js
const DryersScreen = {
    dryerCardTemplate: null,

    async init(data) {
        // Load template once
        if (!this.dryerCardTemplate) {
            const response = await fetch('templates/dryer-card.html');
            this.dryerCardTemplate = await response.text();
        }

        // Get machine status from API
        const statusData = await API.getMachineStatus();
        const allDryers = statusData.data.filter((m) => m.soda_id >= 1 && m.soda_id <= 10);

        let selectedDryers = Cart.getSelectedDryers();

        // If preselected machine
        if (data.preselected) {
            const machineId = parseInt(data.preselected);
            if (!selectedDryers.includes(machineId)) {
                selectedDryers.push(machineId);
                Cart.setSelectedDryers(selectedDryers);
            }
        }

        this.renderDryers(allDryers, selectedDryers);
        this.attachEventListeners();
    },

    renderDryers(dryers, selectedDryers, showBusy = false) {
        const dryersList = document.getElementById('dryers-list');
        if (!dryersList) return;

        // Filter
        let displayDryers = showBusy ? dryers : dryers.filter(
            (d) => d.statusId === "AVAILABLE" || selectedDryers.includes(d.soda_id)
        );

        // Group by pairs
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
                            ${pairDryers.map(d => this.createDryerCard(d, selectedDryers)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        dryersList.innerHTML = html;
    },

    createDryerCard(dryer, selectedDryers) {
        const isSelected = selectedDryers.includes(dryer.soda_id);
        const isAvailable = dryer.statusId === "AVAILABLE";
        const isBusy = dryer.statusId === "IN_USE";
        const location = dryer.soda_id % 2 === 1 ? 'Top' : 'Bottom';

        // Clone template
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.dryerCardTemplate, 'text/html');
        const card = doc.querySelector('.dryer-card');

        // Set data attribute
        card.setAttribute('data-dryer-id', dryer.soda_id);

        // Apply styling
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
        card.querySelector('.dryer-title').textContent = `Dryer ${dryer.soda_id}`;
        card.querySelector('.dryer-location').textContent = location;

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
                Busy (${Utils.formatTime(dryer.remainingSeconds)} left)
            `;
            statusText.style.color = '#FF6B6B';
        }

        // Selected icon
        if (isSelected) {
            card.querySelector('.selected-icon').classList.remove('hidden');
            card.querySelector('.selected-icon').classList.add('flex');
        }

        // Add click handler
        if (isAvailable) {
            card.addEventListener('click', () => this.toggleSelection(dryer.soda_id));
        }

        return card.outerHTML;
    },

    toggleSelection(dryerId) {
        const selectedDryers = Cart.getSelectedDryers();

        if (selectedDryers.includes(dryerId)) {
            Cart.removeDryer(dryerId);
        } else {
            Cart.addDryer(dryerId);
        }

        // Re-render
        API.getMachineStatus().then((statusData) => {
            const allDryers = statusData.data.filter((m) => m.soda_id >= 1 && m.soda_id <= 10);
            const toggle = document.getElementById('show-busy-toggle');
            this.renderDryers(allDryers, Cart.getSelectedDryers(), toggle ? toggle.checked : false);
        });

        this.updateContinueButton();
    },

    attachEventListeners() {
        const toggle = document.getElementById('show-busy-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                API.getMachineStatus().then((statusData) => {
                    const allDryers = statusData.data.filter((m) => m.soda_id >= 1 && m.soda_id <= 10);
                    this.renderDryers(allDryers, Cart.getSelectedDryers(), e.target.checked);
                });
            });
        }

        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            this.updateContinueButton();
            continueBtn.addEventListener('click', () => {
                if (Cart.getSelectedDryers().length > 0) {
                    App.navigateTo('select-dryer-cycles');
                }
            });
        }
    },

    updateContinueButton() {
        const continueBtn = document.getElementById('continue-btn');
        const countSpan = document.getElementById('dryer-count');
        const count = Cart.getSelectedDryers().length;

        if (countSpan) countSpan.textContent = count;

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
    }
};