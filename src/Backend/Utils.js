import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname definiálása ES modulokban
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dinamikus elérési út az ApiKeys.json fájlhoz
const isDev = process.env.NODE_ENV !== 'production';

// Production módban pontosítsuk az elérési utat a build könyvtár figyelembevételével
const apiKeysPath = isDev
    ? path.resolve(__dirname, 'ApiKeys.json') // Fejlesztési mód: src/Backend/ApiKeys.json
    : path.join(process.resourcesPath, 'app.asar', 'build', 'Backend', 'ApiKeys.json'); // Production mód: app.asar/build/Backend/ApiKeys.json

// Debugging az útvonal ellenőrzéséhez
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ApiKeys.json path:', apiKeysPath);

// Load API Keys from JSON file
export const loadApiKeys = async () => {
    try {
        const data = await fs.readFile(apiKeysPath, 'utf-8');
        const keys = JSON.parse(data);
        return keys;
    } catch (error) {
        console.error('Error loading API keys:', error);
        return { apiKey: '', apiSecret: '' };
    }
};

// Save API Keys to JSON file
export const saveApiKeys = async (apiKey, apiSecret) => {
    const data = JSON.stringify({ apiKey, apiSecret }, null, 2);
    try {
        await fs.writeFile(apiKeysPath, data);
        console.log('API keys saved successfully.');
    } catch (error) {
        console.error('Error saving API keys:', error);
    }
};

// Clear API Keys from JSON file
export const clearApiKeys = async () => {
    try {
        await fs.writeFile(apiKeysPath, JSON.stringify({ apiKey: '', apiSecret: '' }, null, 2));
        console.log('API keys cleared successfully.');
    } catch (error) {
        console.error('Error clearing API keys:', error);
    }
};

// Create HMAC Signature
export const createSignature = (params, apiSecret) => {
    const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

    return crypto.createHmac('sha256', apiSecret).update(paramString).digest('hex');
};
