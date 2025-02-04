import React, { useState } from "react";
import { modifyTPSL } from "../Backend/Api";
import './Styling/TPSLPopup.css';

const ModifyTPSLPopup = ({ symbol, currentTP, currentSL, onClose }) => {
    const [takeProfit, setTakeProfit] = useState(currentTP || '');
    const [stopLoss, setStopLoss] = useState(currentSL || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await modifyTPSL(symbol, takeProfit, stopLoss);  // Ez aszinkron, de helyesen kezeljük
            console.log(`TP/SL for ${symbol} modified successfully.`);
            onClose();  // Bezárjuk a popupot sikeres módosítás után
        } catch (error) {
            console.error(`Error modifying TP/SL for ${symbol}:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tpsl-popup-overlay">
            <div className="tpsl-popup-content">
                <h3>Modify TP/SL for {symbol}</h3>
                <label>
                    Take Profit:
                    <input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        placeholder="Take Profit"
                    />
                </label>
                <label>
                    Stop Loss:
                    <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="Stop Loss"
                    />
                </label>
                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default ModifyTPSLPopup;
