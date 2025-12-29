// js/screens/reviewCart.js
const ReviewCartScreen = {
    machineItemTemplate: null,
    sectionTemplate: null,

    async init() {
        // Load templates
        if (!this.machineItemTemplate) {
            const responses = await Promise.all([
                fetch('templates/cart-machine-item.html'),
                fetch('templates/cart-section.html')
            ]);
            
            [this.machineItemTemplate, this.sectionTemplate] = 
                await Promise.all(responses.map(r => r.text()));
        }

        const cartSummary = Cart.getCartSummary();

        if (cartSummary.washers.length === 0 && cartSummary.dryers.length === 0) {
            Utils.showToast('Your cart is empty', 'error');
            App.navigateTo('welcome');
            return;
        }

        this.renderCartSummary(cartSummary);
        this.attachEventListeners();
    },

    renderCartSummary(cartSummary) {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (!cartItems || !cartTotal) return;

        let html = '';
        let machinesTotal = 0;
        let retailTotal = 0;

        // Calculate totals
        cartSummary.washers.forEach(washerId => {
            const cycle = cartSummary.washerCycles[washerId];
            if (cycle) machinesTotal += cycle.price;
        });

        cartSummary.dryers.forEach(dryerId => {
            const cycle = cartSummary.dryerCycles[dryerId];
            if (cycle) machinesTotal += cycle.price;
        });

        // Determine section title and edit target
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

        // Render Machines Section
        if (cartSummary.washers.length > 0 || cartSummary.dryers.length > 0) {
            let machinesHTML = '';

            // Add washers
            cartSummary.washers.forEach(washerId => {
                const cycle = cartSummary.washerCycles[washerId];
                const machineInfo = getMachineType(washerId);

                if (cycle && machineInfo) {
                    machinesHTML += this.createMachineItem(
                        `Washer ${washerId}`,
                        `${cycle.cycle.name} • ${cycle.temperature.name} • ${cycle.cycle.duration}`,
                        cycle.price
                    );
                }
            });

            // Add dryers
            cartSummary.dryers.forEach(dryerId => {
                const cycle = cartSummary.dryerCycles[dryerId];

                if (cycle) {
                    machinesHTML += this.createMachineItem(
                        `Dryer ${dryerId}`,
                        `${cycle.cycle.name} • ${cycle.duration.minutes} min`,
                        cycle.price
                    );
                }
            });

            html += this.createSection(
                machinesSectionTitle,
                machinesEditTarget,
                machinesHTML,
                machinesTotal
            );
        }

        // Retail Products Section
        if (cartSummary.products.length > 0) {
            let productsHTML = '';

            cartSummary.products.forEach(product => {
                retailTotal += product.price * product.quantity;

                productsHTML += this.createMachineItem(
                    product.name,
                    `Qty: ${product.quantity}`,
                    product.price * product.quantity
                );
            });

            html += this.createSection(
                'Retail Items',
                'retail-items',
                productsHTML,
                retailTotal
            );
        }

        cartItems.innerHTML = html;
        cartTotal.textContent = Utils.formatPrice(cartSummary.total);
    },

    createMachineItem(title, details, price) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.machineItemTemplate, 'text/html');
        const item = doc.querySelector('.cart-machine-item');

        item.querySelector('.machine-title').textContent = title;
        item.querySelector('.machine-details').textContent = details;
        item.querySelector('.machine-price').textContent = Utils.formatPrice(price);

        return item.outerHTML;
    },

    createSection(title, editTarget, itemsHTML, subtotal) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.sectionTemplate, 'text/html');
        const section = doc.querySelector('.cart-section');

        section.querySelector('.section-title').textContent = title;
        section.querySelector('.edit-btn').setAttribute('data-edit-target', editTarget);
        section.querySelector('.items-container').innerHTML = itemsHTML;
        section.querySelector('.subtotal-amount').textContent = Utils.formatPrice(subtotal);

        return section.outerHTML;
    },

    attachEventListeners() {
        // Edit buttons
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const target = editBtn.getAttribute('data-edit-target');
                App.navigateTo(target);
            }
        });

        // Payment button
        const paymentBtn = document.getElementById('payment-btn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', () => {
                App.navigateTo('payment-mock');
            });
        }
    }
};