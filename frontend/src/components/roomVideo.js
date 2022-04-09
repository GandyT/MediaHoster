import Session from "../sessionManager.js";
import React from "react"

export default class RoomVideo extends React.Component {
    constructor(props) {
        super(props)

        this.props = props
        this.onPause = props.onPause
        this.onUnpause = props.onUnpause
        this.video = React.createRef()

        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData
        // clientRoom.videoTime uses ms and this class uses seconds
        this.state = {
            paused: clientRoom.paused,
            videoTime: (clientRoom.videoTime / 1000) || 0,
            videoUrl: clientRoom.videoUrl
        }
    }

    componentDidMount = () => {
        // add room callback functions to react with component
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        clientRoom.on("onpause", this.pause)
        clientRoom.on("onunpause", this.unpause)
        clientRoom.on("ontimechange", this.onTimeChange)
        clientRoom.on("onurlchange", this.onUrlChange)

        // play video
        this.video.current.currentTime = this.state.videoTime
        if (!this.state.paused) this.video.current.play()
    }

    pause = () => {
        this.video.current.pause()
        this.setState({ paused: true })
    }

    unpause = () => {
        this.video.current.play()
        this.setState({ paused: false })
    }

    onTimeChange = (newTime) => {
        this.video.current.currentTime = newTime / 1000
        this.setState({ videoTime: newTime / 1000 })
    }

    onUrlChange = (url) => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData
        this.video.current.src = url
        this.video.current.currentTime = 0

        this.setState({ videoUrl: url, videoTime: 0 })
    }

    changeTime = (newTime) => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData
        if (!this.state.videoUrl) return;

        let ws = clientSess.socket
        let sentTime = Math.max(Math.min(newTime, this.video.current.duration), 0)
        ws.send(JSON.stringify({ op: 8, d: { code: clientSess.roomCode, videoTime: sentTime } }))
    }

    renderVideoControls = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        return (
            <div id="customVideoControls">
                {renderLeaderControls()}
                <div id="videoTime">{Math.floor(this.state.videoTime)}</div>
            </div>
        )
    }

    /* 
    this is kinda iffy, it might break stuff but it should increase efficiency
    shouldComponentUpdate = (nextProps) => {
        return false
    }
    */

    videoEnd = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData
        // IF CLIENT IS LEADER, SEND WS PAYLOAD - video ended
        if (this.isClientLeader()) {
            clientSess.socket.send(JSON.stringify({ op: 7, d: { code: clientSess.roomCode } }))
        }

        // clear video data from room
        clientRoom.videoTime = 0
        clientRoom.videoUrl = ""
        this.video.current.src = ""
        this.setState({ videoUrl: "", videoTime: 0 })
        Session.setData(clientSess)
    }

    isClientLeader = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        return clientRoom.players[clientSess.id].isLeader
    }

    render() {
        return (
            <div id="customVideoContainer">
                <video
                    controls={this.isClientLeader()}
                    id="customVideo"
                    src={this.state.videoUrl}
                    ref={this.video}
                    onEnded={this.videoEnd}
                    onPause={() => {
                        if (this.isClientLeader()) {
                            console.log("pause")
                            this.onPause()
                            this.pause()
                        }
                    }}
                    onPlay={() => {
                        if (this.isClientLeader()) {
                            console.log("play")
                            this.onUnpause()
                            this.unpause()
                        }
                    }}
                    onTimeUpdate={() => {
                        let currentTime = this.video.current.currentTime
                        if (this.isClientLeader()) {
                            if (Math.abs(currentTime - this.state.videoTime) >= 1) {
                                this.changeTime(currentTime)
                            }
                        }

                        this.setState({ videoTime: currentTime })
                    }}
                    style={{ pointerEvents: this.isClientLeader() ? "auto" : "none" }}
                />
                {this.renderVideoControls()}
            </div>
        )
    }
}