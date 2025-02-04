import React, { useEffect, useState } from 'react';
import './Styling/Dashboard.css';
import TradingView from './TradingView.jsx';
import { fetchAccountInfo, fetchOpenTrades } from '../Backend/Api.js';

function Dashboard() {
    const [accountInfo, setAccountInfo] = useState([]);
    const [openTrades, setOpenTrades] = useState(0);
    const [apiStatus, setApiStatus] = useState('Disconnected')

    useEffect(() => {
        let isMounted = true;

        const loadAccountInfo = async () => {
            try {
                const data = await fetchAccountInfo();
                if (isMounted) {
                    setAccountInfo(data);
                    setApiStatus('Connected')
                    console.log("Fetched account info:", data)

                }
            } catch (error) {
                if (isMounted) {
                    setApiStatus('Disconnected');
                    console.error("API connection failed", error)
                }
            }

        };

        loadAccountInfo();
        const refreshInterval = localStorage.getItem('refreshInterval') || 5000;
        console.log(`API Refresh interval: ${refreshInterval}`)
        const interval = setInterval(() => {
            loadAccountInfo();
        }, refreshInterval);

        return () => {
            isMounted = false;
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        const getOpenTrades = async () => {
            const tradesCount = await fetchOpenTrades();
            setOpenTrades(tradesCount);
        };

        getOpenTrades();

        // Automatikus frissítés (5 másodpercenként vagy localStorage szerint)
        const refreshInterval = localStorage.getItem('refreshInterval') || 5000;
        const interval = setInterval(getOpenTrades, refreshInterval);

        return () => clearInterval(interval);  // Cleanup az eltávolításkor
    }, []);


    function getRiskLevelColor(riskLevel) {
        if (riskLevel < 30) {
            return 'green'; // Alacsony kockázat
        } else if (riskLevel < 60) {
            return 'orange'; // Közepes kockázat
        } else if (riskLevel < 80) {
            return 'orangered'; // Magas kockázat
        } else {
            return 'red'; // Kritikus kockázat
        }
    };

    function getApiStatusColor(status) {
        return status === 'Connected' ? 'green' : 'red';
    }

    return (
        <div className='dashboard-container'>
            {/* SIDEBAR */}
            <div className="sidebar">
                <div className="api-status-wrapper">
                    <h2>Bybit API</h2>
                    <p className='api-status' style={{ color: getApiStatusColor(apiStatus) }}>
                        <span style={{ color: getApiStatusColor(apiStatus), fontSize: '1.5em' }}>●</span> {apiStatus}
                    </p>
                </div>

                {/* INFO BOXES */}
                <div className='info-box'>
                    {accountInfo.length > 0 ? (
                        accountInfo.map((account, index) => (
                            <div key={index}>
                                <p>Account Equity (Dynamic)</p>
                                <span>{Number(account.totalEquity).toFixed(3)} USDT</span>
                            </div>
                        ))
                    ) : (
                        <div>
                            <p>Account Equity</p>
                            <span>0 USDT</span>
                        </div>
                    )}
                </div>

                <div className="info-box">
                    {accountInfo.length > 0 ? (
                        accountInfo.map((account, index) => (
                            <div key={index}>
                                <p>Account Balance (Available)</p>
                                <span>{Number(account.totalAvailableBalance).toFixed(3)} USDT</span>
                            </div>
                        ))
                    ) : (
                        <div>
                            <p>Account Balance (Available)</p>
                            <span>0 USDT</span>
                        </div>
                    )}

                </div>

                <div className='info-box'>
                    <p>Currently Open Trades</p>
                    <span>{openTrades}</span>
                </div>

                <div className='info-box'>
                    <p>Account Risk Level</p>
                    <span
                        style={{
                            color: getRiskLevelColor(
                                Number(accountInfo.totalInitialMargin) > 0
                                    ? (Number(accountInfo.totalInitialMargin) / Number(accountInfo.totalEquity)) * 100
                                    : 0
                            ),
                            fontWeight: 'bold'
                        }}
                    >
                        {Number(accountInfo.totalInitialMargin) > 0
                            ? ((Number(accountInfo.totalInitialMargin) / Number(accountInfo.totalEquity)) * 100).toFixed(2) + '%'
                            : '0%'
                        }
                    </span>
                </div>



                <button className='update-btn'>No updates available</button>
                <button className='logout-btn'>Logout</button>
            </div>

            {/* TRADINGVIEW CHART */}
            <div className='chart-container'>
                <TradingView />
            </div>
        </div>
    );
}

export default Dashboard;
