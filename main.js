const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const iconv = require('iconv-lite');


process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;

const isMac = process.platform === 'darwin' ? true : false;


let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 800 : 600,
        height: 500,
        icon: 'assets/icons/icon_256x256.png',
        resizable: isDev ? true : false,
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
        backgroundColor: 'white',
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
    options.dest = path.join(os.homedir(), 'imageresize')
    shrinkImage(options)
  })
  
  async function shrinkImage({ imgPath, quality, dest }) {
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