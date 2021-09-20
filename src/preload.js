const {
  contextBridge,
  ipcRenderer
} = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
    ipcM2R: () => ipcRenderer.invoke("ipcM2R")
      .then(res => res)
      .catch(err => console.log(err)),
    ipcR2M: (data) => ipcRenderer.send("ipcR2M",data),
  }
);
// https://github.com/electron/electron/issues/9920
