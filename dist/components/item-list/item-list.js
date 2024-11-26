console.log('ItemList component loaded');

class ItemList {
    constructor(updateState) {
        this.updateState = updateState;
        this.state = {
            items: []
        };
    }

    render() {
        const container = document.createElement('div');
        container.className = 'item-list-section';

        container.innerHTML = `
            <h2 class="section-title">Items</h2>
            
            <!-- Add Item Form -->
            <form id="addItemForm" class="add-item-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="itemDescription">Item Description</label>
                        <input 
                            type="text" 
                            id="itemDescription" 
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="itemQuantity">Qty</label>
                        <input 
                            type="number" 
                            id="itemQuantity" 
                            min="1" 
                            value="1"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="itemPrice">Price (₦)</label>
                        <input 
                            type="number" 
                            id="itemPrice" 
                            min="0" 
                            step="0.01"
                            required
                        >
                    </div>
                </div>

                <div class="btn-add-container">
                    <button type="submit" class="btn-add-item">Add</button>
                </div>
            </form>

            <!-- Items Table -->
            <div class="items-table-container">
                <table class="items-table">
                    <tbody id="itemsTableBody">
                        ${this.renderTableRows()}
                    </tbody>
                </table>
            </div>
        `;

        this.attachEventListeners(container);
        return container;
    }

    renderTableRows() {
        if (!this.state.items.length) return '';

        return this.state.items.map((item, index) => `
            <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₦${this.formatPrice(item.unitPrice)}</td>
                <td class="text-right">₦${this.formatPrice(item.quantity * item.unitPrice)}</td>
                <td class="text-center">
                    <button type="button" class="btn-delete" data-index="${index}">×</button>
                </td>
            </tr>
        `).join('');
    }

    renderEmptyState() {
        if (this.state.items.length) return '';
        
        return `
            <div class="empty-state">
                <p>No items added to the receipt yet</p>
            </div>
        `;
    }

    attachEventListeners(container) {
        const form = container.querySelector('#addItemForm');
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const description = form.itemDescription.value.trim();
            const quantity = parseInt(form.itemQuantity.value);
            const unitPrice = parseFloat(form.itemPrice.value);

            if (description && quantity > 0 && unitPrice >= 0) {
                this.addItem({
                    description,
                    quantity,
                    unitPrice
                });
                form.reset();
                form.itemQuantity.value = "1"; // Reset to default quantity
                form.itemDescription.focus(); // Focus back on description field
            }
        });

        // Handle delete buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const index = parseInt(e.target.dataset.index);
                this.deleteItem(index);
            }
        });
    }

    addItem(item) {
        this.state.items.push(item);
        this.updateState('items', this.state.items);
        this.render();
    }

    deleteItem(index) {
        this.state.items.splice(index, 1);
        this.updateState('items', this.state.items);
        this.render();
    }

    formatPrice(price) {
        return price.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}
