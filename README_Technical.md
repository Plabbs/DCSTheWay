# DCSTheWay - Technical description

## Communication between DCS (Lua scripts) and Node.js
The basic data flow is like this:
### Scripts/TheWay.lua
#### function LuaExportBeforeNextFrame()
Listens on TCP port 41070 for JSON commands list macro to enter into the navigation system using DCS API call "performClickableAction"
#### function LuaExportAfterNextFrame()
Gets the F10 map camera coordinates and sends to UDP port 41069.

### Scripts/Hooks/TheWayHook.lua
Displays crosshairs within view in DCS, controlled by listening to UDP port 41068

### Node.js and Electron
Display the window, handle button presses, listen to coordinates, send commands to TheWay.lua and TheWayHook.lua.
Builds the command macro per module. See folder `/modulecommands`

### Building
The application is built using React.js and Electron. If you'd like to contribute, simply clone the repository and run `npm install`, then `npm run react-start` to start the React page, and `npm run electron-dev` to fire up the Electron side of things.
If you'd like to build/package the code for production, run `npm run package` and check the `dist` folder for the created installer.

The installer does not include handling for the Lua scripts in the DCS World saved games folder.

