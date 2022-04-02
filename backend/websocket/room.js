const generateCode = () => {
    let chars = "ABCDEFGHIJKLMNOPOQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 9; ++i) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

class Room {
    constructor() {
        this.players = {}
        this.code = generateCode() //make function to generate room code
        this.paused = false
        this.videoTime = 0;
        this.videoUrl = "";
        this.lastCheck;
    }

    addPlayer(socket, username) {
        this.broadcast({ op: 3, t: "PLAYER_JOIN", d: { username: "USERNAME", id: socket.id } })

        this.players[socket.id] = { id: socket.id, username: username, isLeader: false }
        if (Object.keys(this.players).length == 1) {
            this.players[socket.id].isLeader = true;
        }
    }

    removePlayer(socket) {
        let wasLeader = this.players[socket.id].isLeader

        delete this.players[socket.id];

        if (Object.keys(this.players) > 0) {
            this.broadcast({ op: 4, t: "PLAYER_LEFT", d: { id: socket.id } });

            if (wasLeader) {
                // pick a new leader
                this.players[Object.keys(this.players)[0]].isLeader = true;
                this.broadcast({ op: 5, t: "NEW_LEADER", d: { id: Object.keys(this.players)[0] } });
            }
        }
    }

    broadcast(data) {
        for (value of Object.values(this.players)) {
            value.socket.send(JSON.stringify(data))
        }
    }

    setPause(bool) {
        this.paused = bool;
        if (this.paused) {
            this.lastCheck = new Date().getTime();
        }
        this.broadcast({ op: 7, t: "PAUSE_UPDATE", d: { paused: bool } });
    }

    getVideoTime() {
        if (this.paused) {
            return this.videoTime;
        }

        let ct = new Date().getTime();
        if (!this.lastCheck) this.lastCheck = ct;

        this.videoTime += ct - this.lastCheck;
        this.lastCheck = ct;

        return this.videoTime;
    }
}

module.exports = Room