const {ipcMain, dialog} = require("electron");
//const CrosshairWindow = require("./CrosshairWindow");
const fs = require("fs");
const dgram = require("dgram"); // Use dgram module for UDP
const {electron} = require("process");

class SelectionHandler {
    crosshairWindow;
    mainWindow;

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        ipcMain.on("f10Start", () => {
            this.f10SelectionStart();
        });
        ipcMain.on("f10Stop", () => {
            this.f10SelectionStop();
        });
        ipcMain.on("saveFile", (event, msg, module) => {
            this.saveFile(msg, module);
        });
        ipcMain.on("openFile", () => {
            this.openFile();
        });
    }
    openFile() {
        dialog
            .showOpenDialog({
                filters: [{name: "TheWay file", extensions: ["tw"]}],
            })
            .then(({filePaths}) => {
                if (filePaths.length === 1) {
                    try {
                        const data = fs.readFileSync(filePaths[0], "utf8");
                        const jsonData = JSON.parse(data);
                        this.mainWindow.webContents.send("fileOpened", jsonData);
                    } catch {}
                }
            });
    }

    saveFile(commands, module) {
        const d = new Date();
        // Filename with timestamp
        const filename = `waypoints_${module}_${d.toISOString().slice(0, -5).replace("T", "_")}`;


        dialog
            .showSaveDialog({
                title: "Save waypoints in a file",
                defaultPath: `${filename}.tw`,
                filters: [{name: "TheWay file", extensions: ["tw"]}],
            })
            .then(({filePath}) => {
                fs.writeFileSync(filePath, commands, "utf-8");
            });
    }

    f10SelectionStart() {
        // Call sendCrosshairMessage() with "show" as argument
        this.sendCrosshairMessage("show");
    }

    f10SelectionStop() {
        // Call sendCrosshairMessage() with "hide" as argument
        this.sendCrosshairMessage("hide");
    }

    createSocket() {
        console.log("Creating new UDP socket");
        const socket = dgram.createSocket("udp4");
        socket.on("error", function (err) {
            console.error("UDP Error:", err);
            socket.close();
        });
        socket.on("close", function () {
            console.log("Socket closed");
        });
        return socket;
    }

    sendCrosshairMessage(msg) {
        console.log("Sending crosshair message");
        const socket = this.createSocket();
        if (socket === undefined) {
            return;
        }
        // Send notification to TheWayHook.lua to show/hide crosshair
        const message = Buffer.from(msg, "utf8");
        socket.send(message, 0, message.length, 41068, "127.0.0.1", (err) => {
            if (err) {
                console.error("Error sending the message:", err);
                socket.close();
            } else {
                console.log(`'${msg}' message sent`);
                socket.close();
            }
        });
    }
}

module.exports = SelectionHandler;
