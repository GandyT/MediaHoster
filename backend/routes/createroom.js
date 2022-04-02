const Express = require("express");
const Router = Express.Router();

const RoomManager = require("../websocket/roomManager.js");

Router.post("/", async (req, res) => {
    let roomCode = RoomManager.createRoom();

    console.log(`Created Room: code - ${roomCode}`)

    res.send({ success: true, t: "ROOM_CREATED", code: roomCode });
});

module.exports = Router;