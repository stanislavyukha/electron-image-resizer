const {
    app,
    BrowserWindow
} = require('electron');


let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image shrink',
        width: 600,
        height: 500,
        icon: 'assets/icons/icon_256x256.png'
    })

    mainWindow.loadFile('./app/index.html')
}



app.on('ready', createMainWindow);