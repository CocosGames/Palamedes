local M = {}
M.id = "id"

local ColyseusClient = require "colyseus.client"
local client
local room

function M.init(osc, ol)
    if client == nil then
        --client = ColyseusClient.new("ws://localhost:2567")
        client = ColyseusClient.new("wss://cauyc1.colyseus.de")
    end
    client:join_or_create("game", {}, function(err, _room)
        if err then
            print("JOIN ERROR: " .. err)
            return
        end

        room = _room
        M.id = _room.sessionId;
        room:on("statechange", osc)
        room:on("leave", ol)
    end)
end

function M.send(type, data)
    if room ~= nil then
        room:send(type, data)
    end
end

function M.close()

end

return M