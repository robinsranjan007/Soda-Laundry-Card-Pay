// js/screens/paymentMock.js
const PaymentMockScreen = {
    init() {
        this.attachEventListeners();
    },

    attachEventListeners() {
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
                    const machines = cartSummary.washers.map((wId) => ({
                        machineId: wId,
                        cycle: cartSummary.washerCycles[wId],
                    }));
                    await API.startMachines(machines);

                    // Navigate to success screen
                    App.navigateTo('payment-success');
                }
            });
        }

        if (failureBtn) {
            failureBtn.addEventListener('click', () => {
                Utils.showToast('Payment failed. Please try again.', 'error');
                App.navigateTo('review-cart');
            });
        }
    }
};