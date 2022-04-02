const Express = require("express");
const Router = Express.Router();

const RoomManager = require("../websocket/roomManager.js");

Router.post("/", async (req, res) => {
    let roomCode = req.body.code;
    let exists = false;

    if (RoomManager.getRoom(roomCode)) {
        exists = true
    }

    res.send({ success: true, t: "ROOM_EXISTS", exists: exists });
});

module.exports = Router;