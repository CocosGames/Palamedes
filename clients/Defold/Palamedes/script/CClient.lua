local M = {}
M.id = "id"

local ColyseusClient = require "colyseus.client"
local client
local room

function M.init(osc, ol)
    client = ColyseusClient.new("ws://localhost:2567")
    --client = ColyseusClient.new("wss://azlmqb.colyseus.in")

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

return M