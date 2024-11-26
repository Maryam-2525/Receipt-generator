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
            // Generate the image blob
            const imageBlob = await this.generateImageBlob();
            
            // For mobile devices
            if (/Android|iPhone/i.test(navigator.userAgent)) {
                // Try Web Share API first
                if (navigator.share) {
                    await navigator.share({
                        files: [new File([imageBlob], 'receipt.png', { type: 'image/png' })],
                        title: 'Receipt',
                    });
                } else {
                    // Fallback to WhatsApp URL scheme
                    const imageUrl = URL.createObjectURL(imageBlob);
                    window.location.href = `whatsapp://send?text=Here's your receipt`;
                }
            } else {
                // For desktop - download the image and open WhatsApp Web
                const imageUrl = URL.createObjectURL(imageBlob);
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = 'receipt.png';
                a.click();
                
                // Open WhatsApp Web
                window.open('https://web.whatsapp.com/', '_blank');
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            alert('To share on WhatsApp: \n1. Save the image \n2. Open WhatsApp \n3. Share the saved image');
            await this.shareAsImage(); // Fallback to regular image download
        }
    }

    async shareToInstagram() {
        try {
            // Generate the image blob
            const imageBlob = await this.generateImageBlob();
            
            // For mobile devices
            if (/Android|iPhone/i.test(navigator.userAgent)) {
                if (navigator.share) {
                    await navigator.share({
                        files: [new File([imageBlob], 'receipt.png', { type: 'image/png' })],
                        title: 'Receipt',
                    });
                } else {
                    throw new Error('Direct sharing not available');
                }
            } else {
                // For desktop - download the image and show instructions
                await this.shareAsImage();
                alert('To share on Instagram: \n1. Open Instagram \n2. Create a new post \n3. Select the downloaded image');
            }
        } catch (error) {
            console.error('Error sharing to Instagram:', error);
            alert('To share on Instagram: \n1. Save the image \n2. Open Instagram \n3. Create a new post with the saved image');
            await this.shareAsImage(); // Fallback to regular image download
        }
    }

    async generateImageBlob() {
        // Hide any buttons or elements you don't want in the image
        const buttons = this.receiptElement.querySelectorAll('.receipt-actions');
        buttons.forEach(btn => btn.style.display = 'none');

        try {
            const canvas = await html2canvas(this.receiptElement.querySelector('.receipt-content'), {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            return new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });
        } finally {
            // Restore hidden elements
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