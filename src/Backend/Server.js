import express from 'express';
import axios from 'axios';
import { loadApiKeys, createSignature, saveApiKeys, clearApiKeys } from './utils.js';
import cors from 'cors';

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

// General function to fetch data from Bybit API
const fetchDataFromBybit = async (endpoint, params, res) => {
    const { apiKey, apiSecret } = await loadApiKeys();

    if (!apiKey || !apiSecret) {
        console.log('API keys are missing.');
        return;
    }

    params.api_key = apiKey;
    params.timestamp = Date.now();
    params.sign = createSignature(params, apiSecret);

    console.log('Requesting Bybit API with params:', params); // Log request params

    try {
        const response = await axios.get(`https://api-demo.bybit.com${endpoint}`, { params });
        res.json(response.data.result.list || []);
    } catch (error) {
        console.log('Error fetching data from Bybit API:', error.response ? error.response.data : error.message);
    }
};

// General function to post data to Bybit api
const postDataToBybit = async (endpoint, params, res) => {
    const { apiKey, apiSecret } = await loadApiKeys();

    if (!apiKey || !apiSecret) {
        console.log('API keys are missing.');
        return res.status(400).json({ message: 'API keys are missing.' });
    }

    params.api_key = apiKey;
    params.timestamp = Date.now();

    if (params.qty) {
        params.qty = parseFloat(params.qty).toFixed(2).toString();  // Ensure qty is in correct format
    }

    params.sign = createSignature(params, apiSecret);

    console.log('Sending POST request to Bybit with params:', params);

    try {
        const response = await axios.post(`https://api-demo.bybit.com${endpoint}`, params);
        res.json(response.data);
    } catch (error) {
        console.log('Error posting data to Bybit API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
};


// API Endpoint: Fetch Positions
app.get('/api/positions', (req, res) => {
    console.log('Request received for positions...');
    fetchDataFromBybit('/v5/position/list', {
        category: 'linear',
        settleCoin: 'USDT'
    }, res);
});

// API Endpoint: Fetch Wallet Balance
app.get('/api/wallet-balance', (req, res) => {
    console.log('Request received for wallet balance...');
    fetchDataFromBybit('/v5/account/wallet-balance', {
        accountType: 'unified'
    }, res);
});

// API Endpoint: Fetch Market Price
app.get('/api/market-price', (req, res) => {
    const { symbol } = req.query;
    console.log(`Request received for market price of ${symbol}...`);

    fetchDataFromBybit('/v5/market/tickers', {
        category: 'linear',
        symbol: symbol.toUpperCase()
    }, res);
});

// API Endpoint: Create order
app.post('/api/create-order', (req, res) => {
    console.log('Create order received');
    const orderParams = {
        category: 'linear',
        symbol: req.body.symbol.toUpperCase(),
        side: req.body.side,
        orderType: req.body.orderType,
        qty: req.body.qty,
        leverage: req.body.leverage,
    };

    // Stop order paraméterek hozzáadása
    if (req.body.orderType === 'Limit' || req.body.orderType === 'Market') {
        orderParams.price = req.body.price;  // Limit orderhez szükséges
    }

    if (req.body.triggerPrice) {
        orderParams.triggerPrice = req.body.triggerPrice;  // Stop-Limit/Market esetén
        orderParams.triggerDirection = 1;  // 1 = ár eléri vagy meghaladja a trigger price-t
    }

    // TP/SL hozzáadása, ha be van kapcsolva
    if (req.body.tpSlEnabled) {
        if (req.body.takeProfit) orderParams.takeProfit = req.body.takeProfit;
        if (req.body.stopLoss) orderParams.stopLoss = req.body.stopLoss;
    }

    postDataToBybit('/v5/order/create', orderParams, res);
});

// API Endpoint: Close Position
app.post('/api/close-position', (req, res) => {
    console.log('Close position received');
    const { symbol } = req.body;

    const closeParams = {
        category: 'linear',
        symbol: symbol.toUpperCase(),
        side: 'Sell',  // Default to Sell, will adjust based on current position
        orderType: 'Market',
        qty: '', // To be filled dynamically based on position size
        reduceOnly: true
    };

    fetchDataFromBybit('/v5/position/list', { category: 'linear', symbol: symbol.toUpperCase() }, {
        json: (positions) => {
            if (positions.length > 0) {
                const position = positions[0];
                closeParams.qty = position.size;
                closeParams.side = position.side === 'Buy' ? 'Sell' : 'Buy';

                postDataToBybit('/v5/order/create', closeParams, res);
            } else {
                res.status(400).json({ message: 'No open position found for the symbol.' });
            }
        }
    });
});


// Set Leverage Endpoint
app.post('/api/set-leverage', async (req, res) => {
    console.log('Setting leverage received');
    const { symbol, leverage } = req.body;

    const params = {
        category: 'linear',
        symbol,
        buy_leverage: leverage,
        sell_leverage: leverage
    };

    await postDataToBybit('/v5/position/set-leverage', params, res);
});

// API Endpoint: Fetch Symbol Info
app.get('/api/symbol-info', (req, res) => {
    const { symbol } = req.query;
    console.log(`Request received for symbol info of ${symbol}...`);

    fetchDataFromBybit('/v5/market/instruments-info', {
        category: 'linear',
        symbol: symbol.toUpperCase()
    }, res);
});

// API Endpoint: Modify TP/SL
app.post('/api/modify-tp-sl', (req, res) => {
    console.log('Modify TP/SL request received');
    const { symbol, takeProfit, stopLoss } = req.body;

    const modifyParams = {
        category: 'linear',
        symbol: symbol.toUpperCase(),
        takeProfit,
        stopLoss
    };

    postDataToBybit('/v5/position/trading-stop', modifyParams, res);
});


// API KEY ENDPOINTS

// API Endpoint: Get API keys
app.get('/api/get-keys', async (req, res) => {
    try {
        const keys = await loadApiKeys();
        if (!keys.apiKey || !keys.apiSecret) {
            console.log('API keys are missing in the JSON file.');
            return res.status(404).json({ message: 'API keys not found in the JSON file.' });
        }
        res.json(keys);
    } catch (error) {
        console.error('Error loading API keys on the server:', error);
        res.status(500).json({ message: 'Failed to load API keys from the server.' });
    }
});

// API Endpoint: Update API keys
app.post('/api/update-keys', async (req, res) => {
    const { apiKey, apiSecret } = req.body;
    await saveApiKeys(apiKey, apiSecret);
    res.status(200).json({ message: 'API Keys updated successfully' });
});

// API Endpoint: Clear API keys
app.post('/api/clear-keys', async (req, res) => {
    await clearApiKeys();
    res.status(200).json({ message: 'API Keys cleared successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
