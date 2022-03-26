class Room {
    constructor(players){
        this.players = {}
        this.code = generateCode //make function to generate room code
    }

    addPlayer(socket, username) {
        this.players[socket.id] = { id: socket.id, username: username, isLeader: false }
        if (Object.keys(this.players).length == 1) {
            this.players[socket.id].isLeader = true;
        }

        this.broadcast({ op: 3, t: "PLAYER_JOIN", d: { username: "USERNAME" }})
    }

    removePlayer(socket) {
        delete this.players.socket
    }

    broadcast(data) {
        for(value of Object.values(this.players)) {
            value.socket.send(JSON.stringify(data))
        }
    }

    pause() {

    }
}

function generateCode() {

}

module.exports = Room