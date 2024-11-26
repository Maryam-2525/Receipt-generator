class BusinessInfo {
    constructor(updateState) {
        this.updateState = updateState;
        this.state = {
            businessName: '',
            address: '',
            phoneNumber: '',
            email: ''
        };
    }

    render() {
        const container = document.createElement('div');
        container.className = 'business-info-section';

        container.innerHTML = `
            <h2 class="section-title">Business Information</h2>
            <form class="business-info-form" id="businessInfoForm">
                <div class="form-group">
                    <label for="businessName">Business Name</label>
                    <input 
                        type="text" 
                        id="businessName" 
                        value="${this.state.businessName}"
                        placeholder="Enter business name"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Phone Number</label>
                    <input 
                        type="text" 
                        id="phoneNumber" 
                        value="${this.state.phoneNumber}"
                        placeholder="Enter phone number"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value="${this.state.email}"
                        placeholder="Enter email address"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="address">Address</label>
                    <input 
                        type="text" 
                        id="address" 
                        value="${this.state.address}"
                        placeholder="Enter business address"
                        required
                    >
                </div>
            </form>
        `;

        this.attachEventListeners(container);
        return container;
    }

    attachEventListeners(container) {
        const form = container.querySelector('#businessInfoForm');
        const inputs = form.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.state[input.id] = e.target.value;
                this.updateState('businessInfo', this.state);
            });
        });
    }
}
