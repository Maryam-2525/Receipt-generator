class ShareReceipt {
    constructor(receiptElement) {
        this.receiptElement = receiptElement;
    }

    async shareAsImage() {
        try {
            // Get the receipt content div
            const receiptContent = this.receiptElement.querySelector('.receipt-content');
            if (!receiptContent) {
                throw new Error('Receipt content not found');
            }

            // Create canvas
            const canvas = await html2canvas(receiptContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true, // Enable logging for debugging
                useCORS: true
            });

            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (!blob) {
                throw new Error('Failed to create image blob');
            }

            // Try sharing or downloading
            if (navigator.share && navigator.canShare) {
                const file = new File([blob], 'receipt.png', { type: 'image/png' });
                const shareData = {
                    files: [file],
                    title: 'Receipt',
                    text: 'Here is your receipt'
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    this.downloadImage(blob);
                }
            } else {
                this.downloadImage(blob);
            }
        } catch (error) {
            console.error('Error in shareAsImage:', error);
            this.handleError(error);
        }
    }

    async shareAsPDF() {
        try {
            // Get the receipt content div
            const receiptContent = this.receiptElement.querySelector('.receipt-content');
            if (!receiptContent) {
                throw new Error('Receipt content not found');
            }

            // Create canvas
            const canvas = await html2canvas(receiptContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true,
                useCORS: true
            });

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Try sharing or downloading
            if (navigator.share && navigator.canShare) {
                const pdfBlob = pdf.output('blob');
                const file = new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' });
                const shareData = {
                    files: [file],
                    title: 'Receipt',
                    text: 'Here is your receipt'
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    pdf.save('receipt.pdf');
                }
            } else {
                pdf.save('receipt.pdf');
            }
        } catch (error) {
            console.error('Error in shareAsPDF:', error);
            this.handleError(error);
        }
    }

    downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'receipt.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleError(error) {
        console.error('Sharing error details:', error);
        if (error.name === 'AbortError') {
            // User cancelled the share
            return;
        }
        alert('Could not share the receipt. Downloading instead...');
    }

    async shareToWhatsApp() {
        try {
            // Generate the PDF first since it's more reliable for sharing
            const pdfBlob = await this.generatePDFBlob();
            
            if (this.isMobileDevice()) {
                // For mobile devices, use the Web Share API if available
                if (navigator.share && navigator.canShare) {
                    const file = new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' });
                    const shareData = {
                        files: [file],
                        title: 'Receipt',
                        text: 'Here is your receipt'
                    };

                    if (navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return;
                    }
                }
                
                // Fallback for mobile: open WhatsApp with a message
                const text = "I'd like to share a receipt with you";
                const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
                window.location.href = whatsappUrl;
                
                // Download the PDF as well since we can't directly attach it
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'receipt.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert('The receipt has been downloaded. Please send it as a file in WhatsApp.');
            } else {
                // For desktop
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'receipt.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Open WhatsApp Web
                window.open('https://web.whatsapp.com/', '_blank');
                alert('1. Open WhatsApp Web\n2. Select a chat\n3. Upload the downloaded receipt file');
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            alert('Unable to share to WhatsApp. The receipt will be downloaded instead.');
            await this.shareAsPDF();
        }
    }

    async shareToInstagram() {
        try {
            const imageBlob = await this.generateImageBlob();
            
            if (this.isMobileDevice()) {
                // Try using the Web Share API first
                if (navigator.share) {
                    const file = new File([imageBlob], 'receipt.png', { type: 'image/png' });
                    await navigator.share({
                        files: [file],
                        title: 'Receipt'
                    });
                } else {
                    // Fallback to downloading and opening Instagram
                    this.downloadImage(imageBlob);
                    window.location.href = 'instagram://';
                    alert('Please upload the downloaded image to Instagram');
                }
            } else {
                // For desktop
                this.downloadImage(imageBlob);
                window.open('https://www.instagram.com/', '_blank');
                alert('1. Open Instagram\n2. Click on the + icon to create a new post\n3. Upload the downloaded receipt image');
            }
        } catch (error) {
            console.error('Error sharing to Instagram:', error);
            alert('Unable to share directly to Instagram. The receipt will be downloaded instead.');
            await this.shareAsImage();
        }
    }

    async generateImageBlob() {
        const receiptContent = this.receiptElement.querySelector('.receipt-content');
        if (!receiptContent) {
            throw new Error('Receipt content not found');
        }

        // Hide share buttons temporarily
        const buttons = this.receiptElement.querySelectorAll('.receipt-actions');
        buttons.forEach(btn => btn.style.display = 'none');

        try {
            const canvas = await html2canvas(receiptContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    // Additional cleanup of the cloned document if needed
                    const clonedContent = clonedDoc.querySelector('.receipt-content');
                    if (clonedContent) {
                        // Remove any unwanted elements from the clone
                        const unwantedElements = clonedContent.querySelectorAll('.no-print, .receipt-actions');
                        unwantedElements.forEach(el => el.remove());
                    }
                }
            });

            return new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });
        } finally {
            // Restore hidden buttons
            buttons.forEach(btn => btn.style.display = '');
        }
    }

    // Helper method to check if running on mobile
    isMobileDevice() {
        return /Android|iPhone/i.test(navigator.userAgent);
    }

    async shareViaEmail() {
        try {
            // Generate PDF blob
            const pdfBlob = await this.generatePDFBlob();
            
            // Get business info for email subject
            const businessName = document.querySelector('.business-name').textContent;
            const receiptNo = document.querySelector('.receipt-no').textContent;
            
            // Create email content
            const subject = encodeURIComponent(`Receipt from ${businessName} - ${receiptNo}`);
            const body = encodeURIComponent('Please find attached your receipt.');
            
            if (navigator.share && navigator.canShare) {
                // Try using native share sheet first (mobile)
                const file = new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' });
                await navigator.share({
                    files: [file],
                    title: `Receipt from ${businessName}`,
                    text: 'Please find attached your receipt.'
                });
            } else {
                // Fallback to mailto link
                const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
                window.location.href = mailtoLink;
                
                // Download the PDF since we can't attach it to mailto
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'receipt.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert('The receipt has been downloaded. Please attach it to your email.');
            }
        } catch (error) {
            console.error('Error sharing via email:', error);
            throw error;
        }
    }

    async generatePDFBlob() {
        const canvas = await html2canvas(this.receiptElement.querySelector('.receipt-content'), {
            scale: 2,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf.output('blob');
    }
}