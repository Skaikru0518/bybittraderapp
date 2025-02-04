import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styling/Settings.css';

const Settings = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [theme, setTheme] = useState('Dark');
    const [refreshInterval, setRefreshInterval] = useState(() => {
        return Number(localStorage.getItem('refreshInterval')) || 10000;
    });
    const [tradeAlerts, setTradeAlerts] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const loadApiKeys = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/get-keys');
                setApiKey(response.data.apiKey || '');
                setApiSecret(response.data.apiSecret || '');
            } catch (error) {
                console.error('Error loading API keys:', error);
            }
        };
        loadApiKeys();
    }, []);

    const displayFeedback = (message) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleSaveApiKeys = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/update-keys', { apiKey, apiSecret });
            if (response.status === 200) displayFeedback('API Keys saved successfully!');
        } catch (error) {
            console.error('Error saving API keys:', error);
            displayFeedback('Failed to save API keys.');
        }
    };

    const handleClearApiKeys = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/clear-keys');
            if (response.status === 200) {
                setApiKey('');
                setApiSecret('');
                displayFeedback('API Keys cleared!');
            }
        } catch (error) {
            console.error('Error clearing API keys:', error);
            displayFeedback('Failed to clear API keys.');
        }
    };

    const handleThemeChange = (e) => {
        const selectedTheme = e.target.value;
        setTheme(selectedTheme);
        localStorage.setItem('theme', selectedTheme);
        displayFeedback(`Theme changed to ${selectedTheme}`);
    };

    const handleRefreshIntervalChange = (e) => {
        const interval = Number(e.target.value);
        setRefreshInterval(interval);
        localStorage.setItem('refreshInterval', interval);
        displayFeedback(`Refresh interval set to ${interval} ms`);
    };

    const handleTradeAlertsToggle = () => {
        const newStatus = !tradeAlerts;
        setTradeAlerts(newStatus);
        localStorage.setItem('tradeAlerts', newStatus);
        displayFeedback(`Trade alerts ${newStatus ? 'enabled' : 'disabled'}`);
    };

    const handleDisconnectApi = () => {
        displayFeedback('API disconnected.');
    };

    const handleReconnectApi = () => {
        displayFeedback('API reconnected.');
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>

            <div className="settings-grid">
                {/* API Keys Management */}
                <div className="settings-section">
                    <h3>API Key Management</h3>
                    <input type="text" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                    <input type="text" placeholder="API Secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
                    <div className="button-group">
                        <button onClick={handleSaveApiKeys}>Save Keys</button>
                        <button onClick={handleClearApiKeys} className="danger">Clear Keys</button>
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="settings-section">
                    <h3>Theme Selection</h3>
                    <select value={theme} onChange={handleThemeChange}>
                        <option value="Dark">Dark</option>
                        <option value="Light">Light</option>
                    </select>
                </div>

                {/* Data Refresh Interval */}
                <div className="settings-section">
                    <h3>Data Refresh Interval (ms)</h3>
                    <select value={refreshInterval} onChange={handleRefreshIntervalChange}>
                        <option value={5000}>5000</option>
                        <option value={10000}>10000</option>
                        <option value={30000}>30000</option>
                    </select>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <h3>Notifications</h3>
                    <div className="checkbox-wrapper">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={tradeAlerts}
                                onChange={handleTradeAlertsToggle}
                            />
                            <span>Trade Alerts</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={tradeAlerts}
                                onChange={handleTradeAlertsToggle}
                            />
                            <span>Trade Alerts</span>
                        </label>
                    </div>
                </div>


                {/* Bybit Connection Manager */}
                <div className="settings-section">
                    <h3>Bybit Connection Manager</h3>
                    <div className="button-group">
                        <button onClick={handleDisconnectApi}>Disconnect API</button>
                        <button onClick={handleReconnectApi}>Reconnect API</button>
                    </div>
                </div>
            </div>

            {/* Feedback Message */}
            {feedback && <div className="popup-feedback"><p>{feedback}</p></div>}
        </div>
    );
};

export default Settings;
