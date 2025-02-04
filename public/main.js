const { exec } = require('child_process');
const { create } = require('domain');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { stderr } = require('process');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,     // Biztonsági okokból kikapcsolva
            contextIsolation: true,     // Az újabb Electron verziókban ajánlott
            enableRemoteModule: false,  // Remote modul kikapcsolása
            sandbox: false,             // Ha a webview nem működik, kapcsold ki a sandboxot
            webviewTag: true,           // Engedélyezi a <webview> használatát!
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, 'index.html'));
    }
}

app.whenReady().then(() => {
    //start backend
    exec('node src/Backend/Server.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`Backend error: ${stderr}`);
        } else {
            console.log(`Backend started ${stdout}`);
        }
    });
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
