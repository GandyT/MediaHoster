const RoomManager = require("./roomManager.js");
const ErrorLoad = JSON.stringify({ success: false });
const SuccessLoad = JSON.stringify({ success: true });

// note: idk if the way im referencing stuff would work cuz i didn't do this for a while
// some1 check and then delete this comment later

function onmessage(payload) {
    const socket = this;
    var data = JSON.parse(payload);
    var op = data.op;
    var d = data.d; // main data stored here ( sorry confusing variable names xd )

    if (op == 1) {
        /* create room
        DEPRECATED: create-room will now use a static api endpoint
        down-sides: we can't check if they are in room so people can spam create but
        who cares it's gonna be some dumb site anyways :D
        if (inRoom) {
            socket.send(ErrorLoad)
            return;
        }

        let roomCode = RoomManager.createRoom();

        socket.send(JSON.stringify({ op: 2, t: "ROOM_CREATED", data: { code: roomCode } }));
        */
    } else if (op == 2) {
        // join room 
        console.log(socket.id + " Joined Room")
        if (socket.inRoom) return socket.send(ErrorLoad)

        let username = d.username
        let roomCode = d.code
        let room = RoomManager.getRoom(roomCode)

        if (!room) return socket.send(ErrorLoad);

        room.addPlayer(socket, username);

        socket.inRoom = true;
        socket.on("close", () => {
            if (room.players[socket.id]) room.removePlayer(socket)
        });

        let circularRemoved = {}
        for (let key of Object.keys(room.players)) {
            circularRemoved[key] = {}
            circularRemoved[key].id = room.players[key].id
            circularRemoved[key].username = room.players[key].username
            circularRemoved[key].isLeader = room.players[key].isLeader
        }

        socket.send(JSON.stringify({
            t: "ROOM_JOIN", op: 6, d: {
                players: circularRemoved,
                videoTime: room.videoTime,
                paused: room.paused,
                videoUrl: room.videoUrl,
                id: socket.id // send them back their id
            }
        }))
    } else if (op == 3) {
        console.log(socket.id + " Left Room")
        // leave room
        if (!socket.inRoom) return socket.send(ErrorLoad)

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);

        room.removePlayer(socket);

        if (Object.keys(room.players).length <= 0) {
            console.log(roomCode + " Room Deleted")
            RoomManager.removeRoom(roomCode);
        }

        socket.inRoom = false;

        socket.send(SuccessLoad);
    } else if (op == 4) {
        console.log(socket.id + " Pause Room")
        // pause room
        if (!socket.inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.setPause(true);

        socket.send(SuccessLoad);
    } else if (op == 5) {
        console.log(socket.id + " Unpause Room")
        // unpause room
        if (!socket.inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.setPause(false);

        socket.send(SuccessLoad);
    } else if (op == 6) {
        console.log(socket.id + " Change Room Url")
        // change url
        if (!socket.inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.videoUrl = d.url;
        room.broadcast({ op: 8, t: "VIDEO_UPDATE", d: { url: d.url } });

        socket.send(SuccessLoad);
    } else if (op == 7) {
        console.log(socket.id + " Video Ended")
        // video ended
        // change url
        if (!socket.inRoom) return socket.send(ErrorLoad);

        let roomCode = d.code;
        let room = RoomManager.getRoom(roomCode);

        if (!room) return socket.send(ErrorLoad);
        if (!room.players[socket.id].isLeader) return socket.send(ErrorLoad);

        room.videoUrl = "";
        room.broadcast({ op: 9, t: "VIDEO_END" });

        socket.send(SuccessLoad);
    }
}

module.exports = onmessage;