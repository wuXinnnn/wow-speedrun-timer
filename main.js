const { app, BrowserWindow, dialog } = require("electron");
// const remoteMain = require("@electron/remote/main");
const path = require("path");
let saved = false;
// try {
//   require("electron-reloader")(module);
// } catch {}
// remoteMain.initialize();
app.disableHardwareAcceleration();
let ipc = require("electron").ipcMain;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: true,
    // titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // win.loadUrl(`file://${__dirname}/index.html`);
  win.loadFile("index.html");
  win.webContents.openDevTools({ mode: "detach" });
  win.on("close", (e) => {
    if (!saved) {
      e.preventDefault();
      win.webContents.send(
        "saveGlobal",
        "quit",
        path.join(__dirname, "last.json")
      );
    }
  });
  //   win.on("closed", () => {
  //     // 取消引用 window 对象，如果你的应用支持多窗口的话，
  //     // 通常会把多个 window 对象存放在一个数组里面，
  //     // 与此同时，你应该删除相应的元素。
  //     win = null;
  //   });
}
app.allowRendererProcessReuse = false;
app.whenReady().then(() => {
  createWindow();
  win.setMenu(null);
});
// app.on("before-quit", function () {
//   win.webContents.send("saveGlobal", "quit", __dirname, "last.json");
// });

let getTime = (YMD, DH, HMS) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var currentDate =
    year + YMD + month + YMD + day + DH + hours + HMS + minutes + HMS + seconds;
  return currentDate;
};
ipc.on("saveGlobalNormal", () => {
  let defaultName = getTime("-", "-", "-");
  dialog
    .showSaveDialog(win, {
      title: "保存当前时间统计",
      defaultPath: defaultName + ".json",
      filters: [{ name: "WST存档文件", extensions: ["json"] }],
    })
    .then((saveInfo) => {
      console.log(saveInfo);
      if (!saveInfo.canceled) {
        win.webContents.send("saveGlobal", "normal", saveInfo.filePath);
      }
    });
});
ipc.on("loadPreset", () => {
  let defaultName = getTime("-", "-", "-");
  dialog
    .showOpenDialog(win, {
      properties: ["openFile", "showHiddenFiles"],
      title: "读取时间统计",
      filters: [{ name: "WST存档文件", extensions: ["json"] }],
    })
    .then((presetInfo) => {
      console.log(presetInfo);
      if (!presetInfo.canceled) {
        win.webContents.send("loadPreset", presetInfo.filePaths[0]);
      }
    });
});
ipc.on("can-quit", () => {
  saved = true;
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
