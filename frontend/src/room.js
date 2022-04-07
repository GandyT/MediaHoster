/* 
EVENTS:
onpause
onunpause
ontimechange
onurlchange
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