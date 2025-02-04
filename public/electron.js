const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (!app.isPackaged) {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadFile(path.join(__dirname, 'index.html'));
    }
}

app.whenReady().then(() => {
    // Ha az app ki van csomagolva, külön kezeljük az útvonalat
    const backendPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app', 'src', 'Backend', 'Server.js')
        : path.join(__dirname, 'src', 'Backend', 'Server.js');

    exec(`node "${backendPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backend error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Backend stderr: ${stderr}`);
            return;
        }
        console.log(`Backend started: ${stdout}`);
    });

    createWindow();
});
