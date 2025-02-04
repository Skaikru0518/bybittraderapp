import axios from 'axios';

const refreshInterval = localStorage.getItem('refreshInterval') || 5000;

export const fetchPositions = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/positions", {
            headers: {
                'x-refresh-interval': refreshInterval
            }
        });
        return response.data;

    } catch (error) {
        console.log("Error fetching data from backend:", error.message);
        return [];
    }
};

export const fetchAccountInfo = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/wallet-balance", {
            headers: {
                'x-refresh-interval': refreshInterval
            }
        });
        return response.data
    } catch (error) {
        console.log("Error fetching wallet info from backend: ", error.message)
        return [];
    }
};

export async function fetchOpenTrades() {
    try {
        const response = await fetch('http://localhost:5000/api/positions');
        const positions = await response.json();

        if (positions && positions.length > 0) {
            return positions.length;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error fetching open trades:', error);
        return 0;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post("http://localhost:5000/api/create-order", orderData);
        console.log("Order Created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const setLeverage = async (symbol, leverage) => {
    try {
        const response = await axios.post("http://localhost:5000/api/set-leverage", { symbol, leverage });
        console.log("Leverage set successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error setting leverage:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fetchMarketPrice = async (symbol) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/market-price?symbol=${symbol}`);
        return response.data.length > 0 ? response.data[0].lastPrice : 'N/A';
    } catch (error) {
        console.error("Error fetching market price for popup:", error.response ? error.response.data : error.message);
        return 'N/A';
    }
};

export const fetchSymbolInfo = async (symbol) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/symbol-info?symbol=${symbol}`);
        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error("Error fetching symbol info:", error.response ? error.response.data : error.message);
        return null;
    }
};

export const closePosition = async (symbol) => {
    try {
        const response = await axios.post("http://localhost:5000/api/close-position", { symbol });
        console.log(`Position for ${symbol} closed successfully:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error closing position for ${symbol}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const modifyTPSL = async (symbol, takeProfit, stopLoss) => {
    try {
        const response = await axios.post("http://localhost:5000/api/modify-tp-sl", { symbol, takeProfit, stopLoss });
        console.log("TP/SL modified successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error modifying TP/SL:", error.response ? error.response.data : error.message);
        throw error;
    }
};

