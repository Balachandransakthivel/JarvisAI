const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const fs = require('fs');

let mainWindow;
let backendProcess;

function getPythonExecutable() {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const pythonCoreDir = path.join(localAppData, 'Python');
      try {
        if (fs.existsSync(pythonCoreDir)) {
          const subdirs = fs.readdirSync(pythonCoreDir);
          for (const subdir of subdirs) {
            const fullPath = path.join(pythonCoreDir, subdir, 'python.exe');
            if (fs.existsSync(fullPath)) {
              console.log(`[Electron]: Detected local Python binary at ${fullPath}`);
              return fullPath;
            }
          }
        }
      } catch (e) {
        console.error(`[Electron]: Error scanning local python path: ${e}`);
      }
    }
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

function startBackend() {
  console.log('Starting JARVIS FastAPI backend...');
  const pythonCmd = getPythonExecutable();
  const backendPath = path.join(__dirname, '..', '..', 'backend', 'main.py');
  
  backendProcess = spawn(pythonCmd, [backendPath], {
    cwd: path.join(__dirname, '..', '..'),
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI Out]: ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI Err]: ${data.toString().trim()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`JARVIS FastAPI backend exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "JARVIS - Personal Desktop Assistant",
    backgroundColor: '#050810',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (!process.env.NO_BACKEND) {
    startBackend();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('Stopping JARVIS FastAPI backend...');
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
