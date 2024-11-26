class ReceiptPreview {
    constructor(state) {
        this.state = state;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'receipt-preview';

        container.innerHTML = `
            <div class="receipt-content">
                <div class="receipt-title">
                    <h2>RECEIPT</h2>
                </div>

                <!-- Business Info -->
                <div class="receipt-header text-center">
                    <h1 class="business-name">${this.state.businessInfo.businessName || 'Business Name'}</h1>
                    <div class="business-contact">
                        <p>${this.state.businessInfo.address || 'Address'}</p>
                        <p>${this.state.businessInfo.phoneNumber || 'Phone Number'}</p>
                        <p>${this.state.businessInfo.email || 'Email'}</p>
                    </div>
                </div>

                <div class="receipt-info text-left">
                    <div class="receipt-no">Receipt No: ${this.state.customerInfo.receiptNumber}</div>
                    <div class="receipt-date">Date: ${this.formatDate(this.state.customerInfo.receiptDate)}</div>
                    <div class="receipt-time">Time: ${this.getCurrentTime()}</div>
                </div>

                <div class="customer-info">
                    <p>Customer Name: ${this.state.customerInfo.customerName || ''}</p>
                    <p>Phone Number: ${this.state.customerInfo.customerPhone || ''}</p>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price (₦)</th>
                            <th>Amount (₦)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderItems()}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="total-label">Total:</td>
                            <td class="total-amount">₦${this.formatPrice(this.calculateTotal())}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="terms-conditions">
                    <h3>Terms and Conditions:</h3>
                    <ul>
                        <li>Refund should be within 24 hours</li>
                        <li>Receipt must be presented on any claims or inquiries</li>
                    </ul>
                </div>

                <div class="receipt-footer">
                    <p class="thank-you-message">Thank you for your patronage, please come back soon!</p>
                </div>
            </div>
        `;

        return container;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderItems() {
        if (!this.state.items.length) {
            return '<tr><td colspan="4" class="no-items">No items</td></tr>';
        }

        return this.state.items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₦${this.formatPrice(item.unitPrice)}</td>
                <td class="text-right">₦${this.formatPrice(item.quantity * item.unitPrice)}</td>
            </tr>
        `).join('');
    }

    calculateTotal() {
        return this.state.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatPrice(price) {
        return price.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}
