// js/screens/paymentSuccess.js
const PaymentSuccessScreen = {
    async init() {
        // Get cart summary before clearing
        const cartSummary = Cart.getCartSummary();

        this.renderSuccessInfo(cartSummary);
        this.attachEventListeners();
    },

    renderSuccessInfo(cartSummary) {
        this.renderRetailItems(cartSummary);
        this.renderMachines(cartSummary);
        this.renderFinishTime(cartSummary);
    },

    renderRetailItems(cartSummary) {
        const retailItemsDiv = document.getElementById('retail-items-pickup');
        if (!retailItemsDiv) return;

        if (cartSummary.products.length > 0) {
            let html = '';
            
            cartSummary.products.forEach((product) => {
                html += `<p>${product.name} x ${product.quantity}</p>`;
            });
            
            retailItemsDiv.innerHTML = html;
        } else {
            retailItemsDiv.innerHTML = '<p class="text-sm" style="color: #6B7280;">No retail items purchased</p>';
        }
    },

    renderMachines(cartSummary) {
        const machinesList = document.getElementById('machines-list');
        if (!machinesList) return;

        let html = '';

        // Washers
        cartSummary.washers.forEach((washerId) => {
            const cycle = cartSummary.washerCycles[washerId];
            if (cycle) {
                const duration = cycle.cycle.duration;
                html += `
                    <div class="flex items-center justify-between py-2">
                        <span class="font-medium" style="color: #36373B;">Washer ${washerId}</span>
                        <span class="text-sm" style="color: #6B7280;">${duration}</span>
                    </div>
                `;
            }
        });

        // Dryers
        cartSummary.dryers.forEach((dryerId) => {
            const cycle = cartSummary.dryerCycles[dryerId];
            if (cycle) {
                const duration = `${cycle.duration.minutes} min`;
                html += `
                    <div class="flex items-center justify-between py-2">
                        <span class="font-medium" style="color: #36373B;">Dryer ${dryerId}</span>
                        <span class="text-sm" style="color: #6B7280;">${duration}</span>
                    </div>
                `;
            }
        });

        machinesList.innerHTML = html;
    },

   renderFinishTime(cartSummary) {
    const finishTimeDiv = document.getElementById('finish-time');
    if (!finishTimeDiv) return;

    // Calculate total duration by adding all machine times
    let totalMinutes = 0;

    // Add washer times
    cartSummary.washers.forEach((washerId) => {
        const cycle = cartSummary.washerCycles[washerId];
        if (cycle && cycle.cycle.duration) {
            const minutes = parseInt(cycle.cycle.duration.replace(/\D/g, ''));
            totalMinutes += minutes;
        }
    });

    // Add dryer times
    cartSummary.dryers.forEach((dryerId) => {
        const cycle = cartSummary.dryerCycles[dryerId];
        if (cycle && cycle.duration.minutes) {
            totalMinutes += cycle.duration.minutes;
        }
    });

    // Calculate finish time
    const now = new Date();
    const finishTime = new Date(now.getTime() + totalMinutes * 60000);
    const timeString = finishTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });

    finishTimeDiv.textContent = `${timeString} (${totalMinutes} minutes)`;
},

    attachEventListeners() {
        const newTransactionBtn = document.getElementById('new-transaction-btn');
        if (newTransactionBtn) {
            newTransactionBtn.addEventListener('click', () => {
                // Clear cart and start fresh
                Cart.clear();
                App.navigateTo('welcome');
            });
        }
    }
};