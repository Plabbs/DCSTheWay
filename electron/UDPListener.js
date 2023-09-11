const dgram = require("dgram");

// Listen for DCS waypoints from TheWay.lua
class UDPListener {
  constructor(mainWindow) {
    const socket = dgram.createSocket("udp4");
    socket.on("message", (msg) => {
      try {
        mainWindow.webContents.send("dataReceived", "" + msg);
      } catch (e) {}
    });
    socket.bind(42069);
  }
}

module.exports = UDPListener;
