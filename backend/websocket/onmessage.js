const RoomManager = require("./websocket/roomManager.js");
const ErrorLoad = JSON.stringify({ success: false });
const SuccessLoad = JSON.stringify({success: true});

// note: idk if the way im referencing stuff would work cuz i didn't do this for a while
// some1 check and then delete this comment later

function onmessage(payload) {
    const socket = this;
    const inRoom = false;
    var data = JSON.parse(payload);
    var op = data.op;
    var d = data.d; // main data stored here ( sorry confusing variable names xd )

   if (op == 1) {
       // create room
        if (inRoom) {
            socket.send(ErrorLoad)
            return;
        }

       let roomCode = RoomManager.createRoom();
       
       socket.send(JSON.stringify({ op: 2, t: "ROOM_CREATED", data: { code: roomCode }}));
   } else if (op == 2) {
        // join room 
        if (inRoom) return socket.send(ErrorLoad)

        let username = d.username
        let roomCode = d.code
        let room = RoomManager.getRoom(roomCode)

        if (!room) return socket.send(ErrorLoad);

        room.addPlayer(socket, username);

        socket.inRoom = true;
        socket.on("close", () => room.removePlayer(socket));
        socket.send(JSON.stringify({ t: "ROOM_JOIN", op: 6, d: {
            players: room.players,
            videoTime: room.videoTime,
            paused: room.paused
        }}))
   } else if (op == 3) {
        // leave room
        if (!inRoom) return socket.send(ErrorLoad)

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);

        room.removePlayer(socket);

        if (room.players.length <= 0) {
            RoomManager.removeRoom(roomCode);
        }

        socket.inRoom = false;

        socket.send(SuccessLoad);
   } else if (op == 4) {
        // pause room
        if (!inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.setPause(true);

        socket.send(SuccessLoad);
    } else if (op == 5) {
        // unpause room
        if (!inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.setPause(false);

        socket.send(SuccessLoad);
   } else if (op == 6) {
       // change url
       if (!inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.videoUrl = d.url;

        socket.send(SuccessLoad);
   }
}

module.exports = onmessage;