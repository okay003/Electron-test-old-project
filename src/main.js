// module
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require("electron");
const fs = require("fs");
const path = require("path");
//
var mainWindow; // main window
const __root = path.dirname(__dirname);
const __configPath = __root + "/config.csv";
const __config = getConfigDictionary(__configPath);
const __picDBPath = __root + "/picDB.csv";
//
function createWindow() {
  mainWindow = new BrowserWindow({ // create main window
    width: 960,
    height: 540,
    alwaysOnTop: true, // always front
    webPreferences: {
      nodeIntegration: false, // for security
      contextIsolation: true, // for security
      enableRemoteModule: false, // for security
      preload: __dirname + "/preload.js" // set preload.js
    }
  });
  mainWindow.loadFile(__dirname + "/index.html"); // set index.html
  mainWindow.webContents.openDevTools(); // open dev tool
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1"; // hide security warning
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// init()
app.on("ready", function() {
  createWindow();
  ipcM2R(__picDBPath)
  ipcMain.on("ipcR2M", (e, data) => {
    console.log(data);
    fs.writeFileSync(__dirname + "/test.csv", data);
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// get key:picDBPath from config.csv, send the dictionary to renderer cia IPC
function ipcM2R(picDBPath) {
  ipcMain.handle("ipcM2R", () => {
    return getPicDBDictionary(picDBPath, __config["picFolderPath"]);
  });
}
// get .csv file form csvPath, make dictionary, return config
function getConfigDictionary(csvPath) {
  var array = [];
  var csv_row = fs.readFileSync(csvPath, "utf8").split("\n");
  for (var i = 0; i < csv_row.length; i++) {
    var csv_col = csv_row[i].split(",");
    switch (csv_col[0]) {
      case "picFolderPath":
        array.picFolderPath = csv_col[1];
        break;
      case "colNum":
        array.colNum = csv_col[1];
        break;
      case "imgWidth":
        array.imgWidth = csv_col[1];
        break;
      default:
    }
  }
  array.shift(); // delete row 1 (BOM code does bad things)
  return array;
}

// get .csv file from csvPath, make dictionary, return picDB
function getPicDBDictionary(csvPath, folderPath) {
  var array = [];
  var csv_row = fs.readFileSync(csvPath, "utf8").split("\n"); // get .csv, make row
  for (var i = 0; i < csv_row.length; i++) {
    var csv_col = csv_row[i].split(",");
    var wrapper = {}; // onetime var for making dictionary
    wrapper.path = folderPath + csv_col[0];
    wrapper.name = csv_col[0];
    wrapper.comment = csv_col[1];
    var innerWrapper = []; // onetime var for making tag array
    for (var j = 2; j < csv_col.length; j++) {
      innerWrapper.push(csv_col[j]);
    }
    wrapper.tags = innerWrapper;
    array[i] = wrapper;
  }
  array.shift(); // delete row 1 (BOM code does bad things)
  return array;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// shutdown apps, when close all window
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    mainWindow = null;
    app.quit();
  }
});
// create mainWindow, when apps get active
app.on("activate", function() {
  if (mainWindow === null) createWindow(); //
});
