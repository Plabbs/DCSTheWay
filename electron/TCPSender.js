const net = require("net");
const { ipcMain } = require("electron");
class TCPSender {
  constructor() {
    ipcMain.on("transfer", (event, msg) => {
      let client = new net.Socket();
      client.connect(41070, "127.0.0.1", function () {
        client.write(JSON.stringify(msg) + "\n");
      });
    });
  }
}

module.exports = TCPSender;
