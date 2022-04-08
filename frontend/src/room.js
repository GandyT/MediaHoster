/* 
EVENTS:
onpause
onunpause
ontimechange
onurlchange
playerupdate ( whatever using this will just get the players list again )
*/

class RoomClass {
    constructor() {
        this.players = {}
        this.paused = false
        this.code = ""
        this.videoTime = 0
        this.videoUrl = ""

        this.events = {}
    }

    addPlayer(id, username) {
        this.players[id] = { username: username, id: id }
        this.call("playerupdate")
    }

    removePlayer(id) {
        if (this.players[id]) {
            delete this.players[id]
            this.call("playerupdate")
        }
    }

    setLeader(id) {
        if (this.players[id]) {
            this.players[id].isLeader = true
            this.call("playerupdate")
        }
    }

    removeLeader() {
        for (let key of Object.keys(this.players)) {
            if (this.players[key].isLeader) {
                this.players[key].isLeader = false;
                this.call("playerupdate")
                return
            }
        }
    }

    pause() {
        this.paused = true
        this.call("onpause")
    }

    unpause() {
        this.paused = false
        this.call("onunpause")
    }

    changeTime(newTime) {
        this.videoTime = newTime
        this.call("ontimechange", newTime)
    }

    changeUrl(newUrl) {
        this.videoUrl = newUrl
        this.call("onurlchange", newUrl)
    }

    on(eventName, callback) {
        if (!this.events[eventName.toLowerCase()]) this.events[eventName.toLowerCase()] = []
        this.events[eventName.toLowerCase()].push(callback)
    }

    call(eventName, ...args) {
        if (this.events[eventName.toLowerCase()]) {
            for (let callback of this.events[eventName.toLowerCase()]) {
                callback(...args)
            }
        }
    }
}

export default RoomClass