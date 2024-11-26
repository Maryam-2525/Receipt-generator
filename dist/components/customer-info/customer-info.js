class CustomerInfo {
    constructor(updateState) {
        this.updateState = updateState;
        this.state = {
            customerName: '',
            customerPhone: '',
            receiptNumber: this.generateReceiptNumber(),
            receiptDate: new Date().toISOString().split('T')[0]
        };
    }

    render() {
        const container = document.createElement('div');
        container.className = 'customer-info-section';

        container.innerHTML = `
            <h2 class="section-title">Customer Information</h2>
            <form class="customer-info-form" id="customerInfoForm">
                <!-- Receipt Details Row -->
                <div class="form-group">
                    <label for="receiptNumber">Receipt Number</label>
                    <input 
                        type="text" 
                        id="receiptNumber" 
                        value="${this.state.receiptNumber}"
                        readonly
                        class="receipt-number"
                    >
                </div>

                <div class="form-group">
                    <label for="receiptDate">Date</label>
                    <input 
                        type="date" 
                        id="receiptDate" 
                        value="${this.state.receiptDate}"
                        required
                    >
                </div>

                <!-- Customer Details -->
                <div class="form-group">
                    <label for="customerName">Customer Name</label>
                    <input 
                        type="text" 
                        id="customerName" 
                        value="${this.state.customerName}"
                        placeholder="Enter customer name"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="customerPhone">Phone Number</label>
                    <input 
                        type="text" 
                        id="customerPhone" 
                        value="${this.state.customerPhone}"
                        placeholder="Enter phone number"
                        required
                    >
                </div>
            </form>
        `;

        this.attachEventListeners(container);
        return container;
    }

    attachEventListeners(container) {
        const form = container.querySelector('#customerInfoForm');
        
        // Handle all inputs except receipt number
        const inputs = form.querySelectorAll('input:not([readonly])');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.state[input.id] = e.target.value;
                this.updateState('customerInfo', this.state);
            });
        });
    }

    generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RCP/${year}${month}${day}/${random}`;
    }
}
