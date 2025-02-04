import React, { useEffect, useState } from 'react';
import { createOrder, setLeverage, fetchMarketPrice, fetchSymbolInfo } from '../Backend/Api';
import './Styling/Trades.css';

function CreateOrderPopup({ onClose }) {
    const [orderData, setOrderData] = useState({
        symbol: '',
        side: 'Buy',
        orderType: 'Limit',
        qty: '',
        leverage: 25,
        orderValue: 0,
        price: '',
        triggerPrice: '',
        requiredMargin: '',
        tpSlEnabled: false,
        takeProfit: '',
        stopLoss: '',
        marketPrice: 0,
        minQty: 0,
        stepSize: 0,
        maxLeverage: 100
    });

    useEffect(() => {
        const fetchMarketDataForSymbol = async () => {
            if (orderData.symbol) {
                try {
                    const price = await fetchMarketPrice(orderData.symbol);
                    const symbolInfo = await fetchSymbolInfo(orderData.symbol);
                    if (price && symbolInfo) {
                        setOrderData(prevData => ({
                            ...prevData,
                            marketPrice: price,
                            minQty: parseFloat(symbolInfo.lotSizeFilter.minOrderQty),
                            stepSize: parseFloat(symbolInfo.lotSizeFilter.qtyStep),
                            maxLeverage: parseFloat(symbolInfo.leverageFilter.maxLeverage)
                        }));
                        console.log(`Fetched market price and symbol info for ${orderData.symbol}:`, price, symbolInfo);
                    } else {
                        console.error(`Market price or symbol info not found for: ${orderData.symbol}`);
                    }
                } catch (error) {
                    console.error('Error fetching market data:', error);
                }
            }
        };
        fetchMarketDataForSymbol();
    }, [orderData.symbol]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...orderData, [name]: value };
        setOrderData(updatedData);

        if (updatedData.orderType === 'Limit' && updatedData.price && updatedData.orderValue && updatedData.leverage) {
            calculateOrderDetails(updatedData);
        } else if (updatedData.orderType === 'Market') {
            calculateMarketOrderDetails(updatedData);
        }
    };

    const roundToStepSize = (qty, stepSize) => {
        const precision = Math.ceil(-Math.log10(stepSize));
        return (Math.floor(qty / stepSize) * stepSize).toFixed(precision);
    };

    const calculateOrderDetails = (data) => {
        const entry = parseFloat(data.price);
        const lev = parseFloat(data.leverage);
        const orderValue = parseFloat(data.orderValue);

        if (entry > 0 && lev > 0 && orderValue > 0) {
            let positionSize = orderValue / entry;
            positionSize = roundToStepSize(positionSize, data.stepSize);
            const requiredMargin = +(orderValue / lev).toFixed(4);

            setOrderData(prevData => ({
                ...prevData,
                qty: positionSize.toString(),
                requiredMargin
            }));
        }
    };

    const calculateMarketOrderDetails = (data) => {
        const lev = parseFloat(data.leverage);
        const orderValue = parseFloat(data.orderValue);
        const marketPrice = parseFloat(data.marketPrice);

        if (lev > 0 && orderValue > 0 && marketPrice > 0) {
            let positionSize = orderValue / marketPrice;
            positionSize = roundToStepSize(positionSize, data.stepSize);
            const requiredMargin = +(orderValue / lev).toFixed(4);

            if (parseFloat(positionSize) >= data.minQty) {
                setOrderData(prevData => ({
                    ...prevData,
                    qty: positionSize.toString(),
                    requiredMargin
                }));
            } else {
                console.error('Calculated qty is below the minimum required:', positionSize);
            }
        }
    };

    const handleOrderSubmit = async (side) => {
        let updatedOrderData = {
            ...orderData,
            side,
            leverage: orderData.leverage.toString()
        };

        if (orderData.orderType === 'Market') {
            if (!orderData.qty || orderData.qty === '') {
                calculateMarketOrderDetails(orderData);
                updatedOrderData.qty = orderData.qty;
            }
        }

        if (orderData.orderType === 'Limit') {
            if (!orderData.price || orderData.price === 0) {
                console.error('Price is required for limit orders.');
                return;
            }
            updatedOrderData.price = orderData.price.toString();
        }

        if (orderData.triggerPrice) {
            updatedOrderData.triggerPrice = orderData.triggerPrice;
            updatedOrderData.triggerDirection = orderData.side === 'Buy' ? 1 : 2;
        }

        if (!updatedOrderData.qty || updatedOrderData.qty === '') {
            console.error('Qty is missing, order cannot be submitted!');
            return;
        }

        console.log('Final Order Data to be sent:', updatedOrderData);

        try {
            await setLeverage(orderData.symbol, orderData.leverage);
            console.log('Leverage set successfully');

            const response = await createOrder(updatedOrderData);
            console.log('Order created successfully:', response);
            onClose();
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3>Create New Order</h3>

                <div className="order-settings">
                    <p>Coin</p>
                    <input
                        type="text"
                        name="symbol"
                        placeholder="Symbol (e.g., BTCUSDT)"
                        value={orderData.symbol}
                        onChange={handleInputChange}
                    />
                    <p>Market Price: {orderData.marketPrice || 'Loading...'} USDT</p>
                    <p>Leverage</p>
                    <select name="leverage" value={orderData.leverage} onChange={handleInputChange}>
                        {[...Array(orderData.maxLeverage).keys()].map(num => (
                            <option key={num + 1} value={num + 1}>{num + 1}x</option>
                        ))}
                    </select>
                </div>

                <div className="order-type-tabs">
                    <button
                        className={orderData.orderType === 'Limit' ? 'active' : ''}
                        onClick={() => setOrderData({ ...orderData, orderType: 'Limit' })}
                    >Limit</button>
                    <button
                        className={orderData.orderType === 'Market' ? 'active' : ''}
                        onClick={() => setOrderData({ ...orderData, orderType: 'Market' })}
                    >Market</button>
                </div>

                <div className="order-input">
                    {orderData.orderType === 'Limit' && (
                        <>
                            <p>Order by Value</p>
                            <input
                                type="number"
                                name="orderValue"
                                placeholder="Order by Value (USDT)"
                                value={orderData.orderValue}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                            <p>Price</p>
                            <input
                                type="number"
                                name="price"
                                placeholder="Price (USDT)"
                                value={orderData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                            <p>Trigger Price (for Conditional Orders)</p>
                            <input
                                type="number"
                                name="triggerPrice"
                                placeholder="Trigger Price (USDT)"
                                value={orderData.triggerPrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                        </>
                    )}
                    {orderData.orderType === 'Market' && (
                        <input
                            type="number"
                            name="orderValue"
                            placeholder="Order Value (USDT)"
                            value={orderData.orderValue}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                        />
                    )}
                </div>

                <div className="order-summary">
                    <p>Qty: <span>{orderData.qty || '0'}</span></p>
                    <p>Order Value: <span>{orderData.orderValue} USDT</span></p>
                    <p>Required Margin: <span style={{ color: orderData.side === 'Buy' ? 'green' : 'red' }}>
                        ~{orderData.requiredMargin || '0'} USDT
                    </span></p>
                </div>

                <label className="tp-sl-checkbox">
                    <input type="checkbox" checked={orderData.tpSlEnabled} onChange={() => setOrderData(prev => ({ ...prev, tpSlEnabled: !prev.tpSlEnabled }))} /> TP/SL
                </label>

                {orderData.tpSlEnabled && (
                    <div className="tp-sl-inputs">
                        <input
                            type="number"
                            name="takeProfit"
                            placeholder="Take Profit Price (USDT)"
                            value={orderData.takeProfit}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                        />
                        <input
                            type="number"
                            name="stopLoss"
                            placeholder="Stop Loss Price (USDT)"
                            value={orderData.stopLoss}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                )}

                <div className="order-buttons">
                    <button className="buy-btn" onClick={() => handleOrderSubmit('Buy')}>Buy / Long</button>
                    <button className="sell-btn" onClick={() => handleOrderSubmit('Sell')}>Sell / Short</button>
                </div>

                <button className="close-popup-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateOrderPopup