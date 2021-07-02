const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const setupEvents = require('./installers/setupEvents')

 if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;


let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 800 : 400,
        height: 550,
        icon: 'assets/icons/icon_256x256.png',
        resizable: isDev ? true : false,
        frame: false,
        autoHideMenuBar: true,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
        icon: 'assets/icons/icon_256x256.png',
        resizable: false,
        frame: false,
        autoHideMenuBar: true,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    aboutWindow.loadFile('./app/about.html')
}


app.on('ready', () => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.on('ready', () => mainWindow = null)
});


const menu = [
    ...(isMac ? [
        { 
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                }
            ]
        }
    ] : []),
    {
        role: 'fileMenu'

    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu: [
                { role: 'reload'},
                { role: 'forcereload'},
                { type: 'separator'},
                { role: 'toggleDevTools'},
            ]
        }
    ] : []),
    ...(!isMac ? [
        { 
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                }
            ]
        }
    ] : []),
]

ipcMain.on('image:minimize', (e, options) => {
    options.dest = path.join(os.homedir(), 'ImageResize')
    resizeImage(options)
  })
  
  async function resizeImage({ imgPath, quality, dest }) {
    try {
      const pngQuality = quality / 100
        for (let i = 0; i < imgPath.length; i++) {
            const files = await imagemin([imgPath[i].replace(/\\/g, '/')], {
                destination: dest,
                plugins: [
                  imageminMozjpeg({ quality }),
                  imageminPngquant({
                    quality: [pngQuality, pngQuality],
                  }),
                ],
              })
              mainWindow.webContents.send('image:converted', i);
        }
      shell.openPath(dest)
    } catch (err) {
      log.error(err)
    }
  }

  ipcMain.on('open-about', (event, arg) => {
    createAboutWindow();
  })

  ipcMain.on('close-btn', (ev,option) => {
      if(option !== 'info'){
        mainWindow.close();
      } else {
          aboutWindow.close();
      }
    
  })

  ipcMain.on('minimize-btn', (ev) => {
      mainWindow.minimize();
  });

  ipcMain.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

//mac os fixes

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
})