// Check if this basic version works first
class ReceiptGenerator {
    constructor() {
        console.log('ReceiptGenerator initializing'); // Debug log
        // Initialize state
        this.state = {
            businessInfo: {
                businessName: '',
                address: '',
                phoneNumber: '',
                email: '',
                logo: null
            },
            customerInfo: {
                customerName: '',
                customerPhone: '',
                customerAddress: '',
                receiptNumber: this.generateReceiptNumber(),
                receiptDate: new Date().toISOString().split('T')[0]
            },
            items: [],
            settings: {
                enableVAT: false,
                vatRate: 0.075
            }
        };

        // Initialize components
        this.initializeComponents();

        // Initialize share functionality
        this.initializeShareButton();
        this.initializePrintButton();
    }

    initializeComponents() {
        console.log('Initializing components'); // Debug log
        // Initialize each component
        this.components = {
            businessInfo: new BusinessInfo(this.updateState.bind(this)),
            customerInfo: new CustomerInfo(this.updateState.bind(this)),
            itemList: new ItemList(this.updateState.bind(this)),
            receiptPreview: new ReceiptPreview(this.state)
        };

        console.log('Components created:', Object.keys(this.components)); // Debug log
        this.mountComponents();
    }

    mountComponents() {
        // Mount Items List first to debug it
        const itemListContainer = document.getElementById('item-list');
        console.log('Item list container:', itemListContainer); // Debug log
        
        if (itemListContainer) {
            itemListContainer.innerHTML = '';
            const itemListElement = this.components.itemList.render();
            console.log('Item list element:', itemListElement); // Debug log
            itemListContainer.appendChild(itemListElement);
            console.log('Items List mounted');
        } else {
            console.error('Items List container not found');
        }

        // Mount Business Info
        const businessInfoContainer = document.getElementById('business-info');
        if (businessInfoContainer) {
            businessInfoContainer.innerHTML = '';
            businessInfoContainer.appendChild(this.components.businessInfo.render());
            console.log('Business Info mounted');
        } else {
            console.error('Business Info container not found');
        }

        // Mount Customer Info
        const customerInfoContainer = document.getElementById('customer-info');
        if (customerInfoContainer) {
            customerInfoContainer.innerHTML = '';
            customerInfoContainer.appendChild(this.components.customerInfo.render());
            console.log('Customer Info mounted');
        } else {
            console.error('Customer Info container not found');
        }

        // Mount Receipt Preview
        const receiptPreviewContainer = document.getElementById('receipt-preview');
        if (receiptPreviewContainer) {
            receiptPreviewContainer.innerHTML = '';
            receiptPreviewContainer.appendChild(this.components.receiptPreview.render());
            console.log('Receipt Preview mounted');
        } else {
            console.error('Receipt Preview container not found');
        }
    }

    updateState(section, data) {
        if (section === 'items') {
            // For items, just update the items array
            this.state.items = data;
        } else {
            // For other sections, update that section's object
            this.state[section] = { ...this.state[section], ...data };
        }
        
        // Update receipt preview
        const previewContainer = document.getElementById('receipt-preview');
        if (previewContainer && this.components.receiptPreview) {
            previewContainer.innerHTML = '';
            this.components.receiptPreview = new ReceiptPreview(this.state);
            previewContainer.appendChild(this.components.receiptPreview.render());
        }
    }

    generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RCP/${year}/${month}/${day}/${random}`;
    }

    initializeShareButton() {
        const shareButton = document.getElementById('share-receipt');
        const receiptContent = document.querySelector('#receipt-preview');

        shareButton.addEventListener('click', () => {
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'share-dropdown-menu';
            dropdownMenu.innerHTML = `
                <div class="social-media-options">
                    <button class="share-option" data-type="whatsapp">
                        <img src="src/assets/icons/whatsapp.svg" alt="WhatsApp" class="share-icon">
                    </button>
                    <button class="share-option" data-type="facebook">
                        <img src="src/assets/icons/facebook.svg" alt="Facebook" class="share-icon">
                    </button>
                    <button class="share-option" data-type="instagram">
                        <img src="src/assets/icons/instagram.svg" alt="Instagram" class="share-icon">
                    </button>
                    <button class="share-option" data-type="email">
                        <img src="src/assets/icons/email.svg" alt="Email" class="share-icon">
                    </button>
                </div>
                <div class="share-divider"></div>
                <div class="save-options">
                    <button class="share-option" data-type="image">
                        <img src="src/assets/icons/image.svg" alt="Save as Image" class="share-icon">
                    </button>
                    <button class="share-option" data-type="pdf">
                        <img src="src/assets/icons/pdf.svg" alt="Save as PDF" class="share-icon">
                    </button>
                </div>
            `;

            const buttonRect = shareButton.getBoundingClientRect();
            dropdownMenu.style.position = 'absolute';
            dropdownMenu.style.top = `${buttonRect.bottom + 5}px`;
            dropdownMenu.style.left = `${buttonRect.left}px`;

            // Remove existing dropdown if any
            const existingDropdown = document.querySelector('.share-dropdown-menu');
            if (existingDropdown) {
                existingDropdown.remove();
            }

            document.body.appendChild(dropdownMenu);

            // Handle share options
            const shareReceipt = new ShareReceipt(receiptContent);
            dropdownMenu.addEventListener('click', async (e) => {
                const button = e.target.closest('.share-option');
                if (button) {
                    const shareType = button.dataset.type;
                    try {
                        switch(shareType) {
                            case 'whatsapp':
                                await shareReceipt.shareToWhatsApp();
                                break;
                            case 'facebook':
                                await shareReceipt.shareToFacebook();
                                break;
                            case 'instagram':
                                await shareReceipt.shareToInstagram();
                                break;
                            case 'email':
                                await shareReceipt.shareViaEmail();
                                break;
                            case 'image':
                                await shareReceipt.shareAsImage();
                                break;
                            case 'pdf':
                                await shareReceipt.shareAsPDF();
                                break;
                        }
                    } catch (error) {
                        console.error('Error sharing:', error);
                        alert('There was an error sharing the receipt. Please try again.');
                    }
                    dropdownMenu.remove();
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdownMenu.contains(e.target) && e.target !== shareButton) {
                    dropdownMenu.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }

    initializePrintButton() {
        const printButton = document.getElementById('printReceipt');
        printButton.addEventListener('click', () => {
            // Hide other elements before printing
            const appHeader = document.querySelector('.app-header');
            const receiptBuilder = document.querySelector('.receipt-builder');
            const receiptActions = document.querySelector('.receipt-actions');
            
            appHeader.style.display = 'none';
            receiptBuilder.style.display = 'none';
            receiptActions.style.display = 'none';

            // Print
            window.print();

            // Restore elements after printing
            appHeader.style.display = '';
            receiptBuilder.style.display = '';
            receiptActions.style.display = '';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app'); // Debug log
    new ReceiptGenerator();
});

