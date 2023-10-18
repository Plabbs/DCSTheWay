package.path = package.path .. ";.\\Scripts\\?.lua;.\\Scripts\\UI\\?.lua;"
package.cpath = package.cpath .. ";.\\LuaSocket\\?.dll;"
package.path = package.path .. ";.\\LuaSocket\\?.lua;"

--local JSON = loadfile("Scripts\\JSON.lua")()
local dxgui = require('dxgui')
local DialogLoader = require("DialogLoader")
local lfs = require("lfs")
local socket = require("socket")

local Crosshair =
{
    -- Scratchpad resources
    logFile = io.open(lfs.writedir() .. [[Logs\TheWay.log]], "w"),

    -- State
    isHidden = true,
    inMission = false,

    -- Crosshair resources
    crosshairWindow = nil,

    address = '127.0.0.1',
    port = 42068,
    server = nil,
}

function Crosshair:log(str)
    if not str then
        return
    end

    if self.logFile then
        self.logFile:write("[" .. os.date("%H:%M:%S") .. "] " .. str .. "\r\n")
        self.logFile:flush()
    end
end

function Crosshair:show()
    if self.inMission == false then
        return
    end
    self.crosshairWindow:setVisible(true);
    self.isHidden = false;
end

function Crosshair:hide()
    if self.inMission == false then
        return
    end
    self.crosshairWindow:setVisible(false)
    self.isHidden = true
end

function Crosshair:toggle()
    if self.isHidden then
        self:log("Showing crosshair")
        self:show()
    else
        self:log("Hiding crosshair")
        self:hide()
    end
end

function Crosshair:checkForIncomingConnections()
    if self.server == nil then
        self.server = socket.udp()         -- Create a new UDP object
        self.server:setsockname(self.address, self.port)
        self.server:settimeout(0)               -- Non-blocking mode (optional)

        if self.server then
            self:log("Server started on " .. self.address .. ":" .. self.port)
        else
            self:log("Failed to start server on " .. self.address .. ":" .. self.port)
            return
        end
    end

    local data, ip, port = self.server:receivefrom()  -- Receive data from any client
    if data then
        self:log("Received command: " .. data)
        if data == "toggle" then
            self:toggle()
        elseif data == "show" then
            self:show()
        elseif data == "hide" then
            self:hide()
        end
    end
end

function Crosshair:createCrosshairWindow()
    if self.crosshairWindow ~= nil then
        return
    end

    self.crosshairWindow = DialogLoader.spawnDialogFromFile(lfs.writedir() .. "Scripts\\TheWay\\crosshair.dlg")
    if self.crosshairWindow == nil then
        self:log("Failed to create crosshair window")
        return
    end    

    local screenWidth, screenHeigt = dxgui.GetScreenSize()
    local x = screenWidth / 2 - 16
    local y = screenHeigt / 2 - 16
    self.crosshairWindow:setBounds(math.floor(x), math.floor(y), 32, 32)

    self:log("Crosshair window created")

    self:hide()
end

local function initCrosshair()
    local lastCheckTime = nil;

    local handler = {}

    function handler.onSimulationFrame()
        if not Crosshair.crosshairWindow then
            Crosshair:log("[TheWay Hook] Creating crosshair hidden...")
            Crosshair:createCrosshairWindow();
        else
            -- Only check for incoming connections periodically to avoid performance issues
            local now = socket.gettime()
            if lastCheckTime == nil or now - lastCheckTime > 0.75 then
                Crosshair:checkForIncomingConnections();
                lastCheckTime = now
            end
        end
    end

    function handler.onMissionLoadEnd()
        Crosshair.inMission = true
    end

    function handler.onSimulationStop()
        Crosshair.inMission = false
        Crosshair:hide()
    end

    DCS.setUserCallbacks(handler)

    net.log("[TheWay Hook] Loaded ...")
end

local status, err = pcall(initCrosshair)
if not status then
    net.log("[TheWay Hook] Load Error: " .. tostring(err))
else
    net.log("[TheWay Hook] Load Success");
end
