local M = {}

local ColyseusClient = require "colyseus.client"
local client
local room

function M.init()
    client = ColyseusClient.new("ws://localhost:2567")
    client:join_or_create("game", {}, function(err, _room)
        if err then
            print("JOIN ERROR: " .. err)
            return
        end

        room = _room
        room:on("statechange", function(state)
            pprint("new state:", state)
        end)
    end)
end

function M.send(type, data)
    if room ~= nil then
        room:send(type, data)
    end
end

return M