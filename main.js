const { app, BrowserWindow, Menu, globalShortcut } = require('electron');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV != 'production' ? true : false;

const isMac = process.platform === 'darwin' ? true : false;


let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: 600,
        height: 500,
        icon: 'assets/icons/icon_256x256.png',
        resizable: isDev ? true : false,
        backgroundColor: 'white',
    })

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

    // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload()); replaced with roles
    // globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => mainWindow.toggleDevTools());

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
    // label: 'File',
    // submenu: [
    //     {

    //     label: 'Quit',
    //     accelerator: isMac ? 'Command+W' : 'Ctrl+W', // 'CmdOrCtrl+W'
    //     click: () => app.quit()
    //     },
    // ],
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