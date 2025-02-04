import React, { useEffect, useState } from 'react';
import { fetchPositions, closePosition } from '../Backend/Api';
import CreateOrderPopup from './CreateOrderPopup';
import ModifyTPSLPopup from './ModifyTPSLPopup';
import './Styling/Trades.css';

function Trades() {
    const [positions, setPositions] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isTPSLPopupOpen, setIsTPSLPopupOpen] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [currentTP, setCurrentTP] = useState(null);
    const [currentSL, setCurrentSL] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadPositions = async () => {
            const data = await fetchPositions();
            if (isMounted) {
                setPositions(data);
                console.log("Fetched positions:", data);
            }
        };

        loadPositions();
        const refreshInterval = localStorage.getItem('refreshInterval') || 5000;
        console.log(`API Refresh interval: ${refreshInterval}`);
        const interval = setInterval(() => {
            loadPositions();
        }, refreshInterval);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleClosePosition = async (symbol) => {
        try {
            await closePosition(symbol);
            console.log(`${symbol} position closed successfully.`);
            setPositions(prevPositions => prevPositions.filter(position => position.symbol !== symbol));
        } catch (error) {
            console.error(`Error closing ${symbol} position:`, error);
        }
    };

    const handleModifyTPSL = (symbol, takeProfit, stopLoss) => {
        setSelectedSymbol(symbol);
        setCurrentTP(takeProfit);
        setCurrentSL(stopLoss);
        setIsTPSLPopupOpen(true);
    };

    return (
        <div>
            <h2>Open Positions</h2>

            <button className="create-order-btn" onClick={handleOpenPopup}>Create Order</button>

            {isPopupOpen && (
                <CreateOrderPopup onClose={handleClosePopup} />
            )}

            {isTPSLPopupOpen && (
                <ModifyTPSLPopup
                    symbol={selectedSymbol}
                    currentTP={currentTP}
                    currentSL={currentSL}
                    onClose={() => setIsTPSLPopupOpen(false)}
                />
            )}

            <table className='mainTable'>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Market Price</th>
                        <th>Entry</th>
                        <th>Position Size</th>
                        <th>Value</th>
                        <th>Direction</th>
                        <th>Leverage</th>
                        <th>Unrealized PNL</th>
                        <th>Realized PNL</th>
                        <th>TP</th>
                        <th>SL</th>
                        <th>Modify</th>
                        <th>Instant Close</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.length > 0 ? (
                        positions.map((position, index) => (
                            <tr key={index}>
                                <td>{position.symbol}</td>
                                <td>{position.markPrice} USDT</td>
                                <td>{position.avgPrice} USDT</td>
                                <td>{position.side === "Buy" ? `${position.size} ${position.symbol.slice(0, -4)}` : `-${position.size} ${position.symbol.slice(0, -4)}`}</td>
                                <td>{position.value} USDT</td>
                                <td style={{ color: position.side === "Buy" ? "green" : "red" }}>{position.side}</td>
                                <td>{position.leverage}x</td>
                                <td style={{ color: position.unrealisedPnl > 0 ? "green" : "red" }}>{position.unrealisedPnl}</td>
                                <td style={{ color: position.curRealisedPnl > 0 ? "green" : "red" }}>{position.curRealisedPnl}</td>
                                <td>{position.takeProfit}</td>
                                <td>{position.stopLoss}</td>
                                <td><button className='tp-sl-button' onClick={() => handleModifyTPSL(position.symbol, position.takeProfit, position.stopLoss)}>TP/SL</button></td>
                                <td><button className='closeButton' onClick={() => handleClosePosition(position.symbol)}>Market</button></td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="13">No open positions.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Trades;
