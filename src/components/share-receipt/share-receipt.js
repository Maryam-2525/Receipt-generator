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
            console.log('Starting WhatsApp share...');
            
            // Generate the PDF blob
            console.log('Generating PDF...');
            const pdfBlob = await this.generatePDFBlob();
            console.log('PDF blob generated:', pdfBlob);

            if (this.isMobileDevice()) {
                console.log('Mobile device detected');
                
                // Create the file object
                const file = new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' });
                const shareData = {
                    files: [file],
                    title: 'Receipt',
                    text: 'Here is your receipt'
                };

                // Check if Web Share API is supported and can share files
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    console.log('Web Share API available and can share files');
                    try {
                        await navigator.share(shareData);
                        console.log('Share successful');
                        return;
                    } catch (shareError) {
                        console.log('Share failed, falling back to WhatsApp direct:', shareError);
                    }
                }

                // Fallback to WhatsApp direct share
                console.log('Using WhatsApp direct share fallback');
                // Download the PDF first
                this.downloadPDF(pdfBlob);
                
                // Then open WhatsApp
                setTimeout(() => {
                    const text = 'Please find the receipt I just downloaded';
                    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
                    window.location.href = whatsappUrl;
                }, 1000); // Small delay to ensure download starts first
                
            } else {
                console.log('Desktop device detected');
                // Desktop fallback
                this.downloadPDF(pdfBlob);
                setTimeout(() => {
                    window.open('https://web.whatsapp.com/', '_blank');
                    alert('The receipt has been downloaded.\n1. Open WhatsApp Web\n2. Select a chat\n3. Click the attachment icon\n4. Upload the downloaded receipt');
                }, 1000);
            }
        } catch (error) {
            console.error('Error in shareToWhatsApp:', error);
            alert(`Sharing failed: ${error.message}\nThe receipt will be downloaded instead.`);
            try {
                const pdfBlob = await this.generatePDFBlob();
                this.downloadPDF(pdfBlob);
            } catch (downloadError) {
                console.error('Download fallback failed:', downloadError);
                alert('Unable to download the receipt. Please try again.');
            }
        }
    }

    // New helper method for downloading PDF
    downloadPDF(blob) {
        console.log('Downloading PDF...');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'receipt.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download initiated');
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
        console.log('Getting receipt content');
        const receiptContent = this.receiptElement.querySelector('.receipt-content');
        if (!receiptContent) {
            throw new Error('Receipt content element not found');
        }

        console.log('Creating canvas');
        const canvas = await html2canvas(receiptContent, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: true // Enable html2canvas logging
        });

        console.log('Creating PDF');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        console.log('Generating PDF blob');
        return pdf.output('blob');
    }
}