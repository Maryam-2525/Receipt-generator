class SettingsPanel {
    constructor(updateSettings) {
        this.updateSettings = updateSettings;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'settings-panel';

        container.innerHTML = `
            <div class="settings-header">
                <h2>Settings</h2>
                <button class="btn-close">×</button>
            </div>

            <form id="settingsForm">
                <div class="settings-group">
                    <h3>General</h3>
                    
                    <label class="setting-item">
                        <span>Currency</span>
                        <select name="currency">
                            <option value="NGN">Nigerian Naira (₦)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </label>

                    <label class="setting-item">
                        <span>VAT Rate (%)</span>
                        <input type="number" 
                               name="vatRate" 
                               min="0" 
                               max="100" 
                               step="0.5" 
                               value="7.5">
                    </label>

                    <label class="setting-item">
                        <span>Date Format</span>
                        <select name="dateFormat">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </label>
                </div>

                <div class="settings-group">
                    <h3>Appearance</h3>
                    
                    <label class="setting-item">
                        <span>Dark Mode</span>
                        <input type="checkbox" name="darkMode">
                    </label>

                    <label class="setting-item">
                        <span>Font Size</span>
                        <select name="fontSize">
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </label>
                </div>

                <div class="settings-group">
                    <h3>Auto-Save</h3>
                    
                    <label class="setting-item">
                        <span>Enable Auto-Save</span>
                        <input type="checkbox" name="autoSave" checked>
                    </label>

                    <label class="setting-item">
                        <span>Auto-Save Interval (seconds)</span>
                        <input type="number" 
                               name="autoSaveInterval" 
                               min="10" 
                               max="300" 
                               value="30">
                    </label>
                </div>

                <div class="settings-group">
                    <h3>Tax Settings</h3>
                    
                    <label class="setting-item">
                        <span>Enable VAT</span>
                        <input type="checkbox" 
                               name="enableVAT" 
                               ${this.state.settings.enableVAT ? 'checked' : ''}>
                    </label>

                    <label class="setting-item ${this.state.settings.enableVAT ? '' : 'disabled'}">
                        <span>VAT Rate (%)</span>
                        <input type="number" 
                               name="vatRate" 
                               min="0" 
                               max="100" 
                               step="0.5" 
                               value="${(this.state.settings.vatRate * 100) || 7.5}"
                               ${this.state.settings.enableVAT ? '' : 'disabled'}>
                    </label>
                </div>

                <div class="settings-actions">
                    <button type="submit" class="btn-primary">Save Settings</button>
                    <button type="button" class="btn-secondary">Reset to Default</button>
                </div>
            </form>
        `;

        this.attachEventListeners(container);
        return container;
    }

    attachEventListeners(container) {
        // VAT toggle handler
        const vatToggle = container.querySelector('input[name="enableVAT"]');
        const vatRateInput = container.querySelector('input[name="vatRate"]');

        vatToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            vatRateInput.disabled = !enabled;
            vatRateInput.parentElement.classList.toggle('disabled', !enabled);
            
            // Update settings
            this.updateSettings({
                enableVAT: enabled,
                vatRate: enabled ? parseFloat(vatRateInput.value) / 100 : 0
            });
        });

        vatRateInput.addEventListener('change', (e) => {
            if (vatToggle.checked) {
                this.updateSettings({
                    vatRate: parseFloat(e.target.value) / 100
                });
            }
        });

        // ... other event listeners ...
    }
}