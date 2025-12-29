// js/screens/paymentSuccess.js
const PaymentSuccessScreen = {
    orderItemTemplate: null,

    async init() {
        // Load template
        if (!this.orderItemTemplate) {
            const response = await fetch('templates/order-summary-item.html');
            this.orderItemTemplate = await response.text();
        }

        // Get cart summary before clearing
        const cartSummary = Cart.getCartSummary();

        this.renderOrderSummary(cartSummary);
        this.attachEventListeners();
    },

    renderOrderSummary(cartSummary) {
        const orderSummary = document.getElementById('order-summary');
        const totalPaid = document.getElementById('total-paid');

        if (!orderSummary || !totalPaid) return;

        let html = '';

        // Washers
        if (cartSummary.washers.length > 0) {
            cartSummary.washers.forEach((washerId) => {
                const cycle = cartSummary.washerCycles[washerId];
                const machineInfo = getMachineType(washerId);
                const sizeLabel = machineInfo.machine.category === 'S' ? 'Small' :
                                 machineInfo.machine.category === 'M' ? 'Medium' : 'Large';

                if (cycle) {
                    html += this.createOrderItem(
                        `Washer #${washerId} (${sizeLabel})`,
                        cycle.price
                    );
                }
            });
        }

        // Dryers
        if (cartSummary.dryers.length > 0) {
            cartSummary.dryers.forEach((dryerId) => {
                const cycle = cartSummary.dryerCycles[dryerId];

                if (cycle) {
                    html += this.createOrderItem(
                        `Dryer #${dryerId}`,
                        cycle.price
                    );
                }
            });
        }

        // Retail Products
        if (cartSummary.products.length > 0) {
            cartSummary.products.forEach((product) => {
                html += this.createOrderItem(
                    `${product.name} (x${product.quantity})`,
                    product.price * product.quantity
                );
            });
        }

        orderSummary.innerHTML = html;
        totalPaid.textContent = Utils.formatPrice(cartSummary.total);
    },

    createOrderItem(name, price) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.orderItemTemplate, 'text/html');
        const item = doc.querySelector('.order-summary-item');

        item.querySelector('.item-name').textContent = name;
        item.querySelector('.item-price').textContent = Utils.formatPrice(price);

        return item.outerHTML;
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