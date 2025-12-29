// js/screens/retailItems.js
const RetailItemsScreen = {
    productTemplate: null,
    allProducts: [],

    async init() {
        // Load template
        if (!this.productTemplate) {
            const response = await fetch('templates/product-item.html');
            this.productTemplate = await response.text();
        }

        // Get products from API
        const productsData = await API.getProducts();
        this.allProducts = productsData.products || [];

        const selectedProducts = Cart.getSelectedProducts();

        this.renderProducts(this.allProducts, selectedProducts);
        this.updateItemCount();
        this.attachEventListeners();
    },

    renderProducts(products, selectedProducts) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        // Group products by category
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
                        ${this.renderProductItems(washerDetergent, selectedProducts)}
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

        html += '</div>';
        productsGrid.innerHTML = html;
    },

    renderProductItems(products, selectedProducts) {
        return products.map(product => {
            const selectedProduct = selectedProducts.find(p => p.id === product.id);
            const quantity = selectedProduct ? selectedProduct.quantity : 0;

            const parser = new DOMParser();
            const doc = parser.parseFromString(this.productTemplate, 'text/html');
            const item = doc.querySelector('.product-item');

            item.setAttribute('data-product-id', product.id);
            item.querySelector('.product-name').textContent = product.name;
            item.querySelector('.product-price').textContent = Utils.formatPrice(product.price);

            if (quantity > 0) {
                item.querySelector('.add-btn').style.display = 'none';
                item.querySelector('.quantity-controls').classList.remove('hidden');
                item.querySelector('.quantity-controls').classList.add('flex');
                item.querySelector('.quantity').textContent = quantity;
            } else {
                item.querySelector('.add-btn').style.display = 'block';
                item.querySelector('.quantity-controls').classList.add('hidden');
            }

            return item.outerHTML;
        }).join('');
    },

    attachEventListeners() {
        // Event delegation for all product buttons
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-btn');
            if (addBtn) {
                const productId = parseInt(addBtn.closest('.product-item').getAttribute('data-product-id'));
                this.addProduct(productId);
            }

            const increaseBtn = e.target.closest('.increase-btn');
            if (increaseBtn) {
                const productId = parseInt(increaseBtn.closest('.product-item').getAttribute('data-product-id'));
                this.increaseQuantity(productId);
            }

            const decreaseBtn = e.target.closest('.decrease-btn');
            if (decreaseBtn) {
                const productId = parseInt(decreaseBtn.closest('.product-item').getAttribute('data-product-id'));
                this.decreaseQuantity(productId);
            }
        });

        // Continue button
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            this.updateContinueButton();
            continueBtn.addEventListener('click', () => {
                App.navigateTo('review-cart');
            });
        }
    },

    addProduct(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            Cart.addProduct(product);
            const selectedProducts = Cart.getSelectedProducts();
            this.renderProducts(this.allProducts, selectedProducts);
            this.updateItemCount();
            this.updateContinueButton();
        }
    },

    increaseQuantity(productId) {
        const selectedProducts = Cart.getSelectedProducts();
        const product = selectedProducts.find(p => p.id === productId);

        if (product) {
            Cart.updateProductQuantity(productId, product.quantity + 1);
            const updatedProducts = Cart.getSelectedProducts();
            this.renderProducts(this.allProducts, updatedProducts);
            this.updateItemCount();
            this.updateContinueButton();
        }
    },

    decreaseQuantity(productId) {
        const selectedProducts = Cart.getSelectedProducts();
        const product = selectedProducts.find(p => p.id === productId);

        if (product) {
            Cart.updateProductQuantity(productId, product.quantity - 1);
            const updatedProducts = Cart.getSelectedProducts();
            this.renderProducts(this.allProducts, updatedProducts);
            this.updateItemCount();
            this.updateContinueButton();
        }
    },

    updateItemCount() {
        const countSpan = document.getElementById('item-count');
        const selectedProducts = Cart.getSelectedProducts();
        const totalItems = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

        if (countSpan) {
            countSpan.textContent = totalItems;
        }
    },

updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        const total = Cart.calculateTotal();
        continueBtn.innerHTML = `Continue • ${Utils.formatPrice(total)}`;
        
        // Apply your custom gradient and shadow
        continueBtn.className = 'w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-95';
        continueBtn.style.background = 'linear-gradient(84.72deg, #2347B0 29.23%, #8EB6DC 130.88%)';
        continueBtn.style.boxShadow = '0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)';
        continueBtn.style.color = 'white';
    }
}
};