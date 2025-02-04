import React from 'react';

const TradingView = () => {
    const isDev = !window.location.href.startsWith('file://');

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {isDev ? (
                <p style={{ color: 'white', textAlign: 'center', paddingTop: '20px' }}>
                    WebView is disabled in development mode. Please build the app to use TradingView.
                </p>
            ) : (
                <webview
                    src="https://www.tradingview.com/chart/"
                    style={{ width: '100%', height: '100%' }}
                    allowpopups="true"
                />
            )}
        </div>
    );
};

export default TradingView;
