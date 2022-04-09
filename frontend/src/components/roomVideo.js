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
        window.setInterval(() => {
            this.setState({ videoTime: this.video.current?.currentTime })
        }, 1000)

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

    componentDidUpdate = () => {
        if (!this.state.videoUrl) return

        if (!this.state.paused) {
            this.video.current.play()
        } else {
            this.video.current.pause()
        }
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

        let renderBtn = () => {
            if (this.state.paused) {
                return <button id="playBtn" onClick={this.onUnpause}>play</button>
            } else {
                return <button id="pauseBtn" onClick={this.onPause}>pause</button>
            }
        }

        let renderLeaderControls = () => {
            if (!clientRoom.players[clientSess.id].isLeader) return;

            return (
                <React.Fragment>
                    {renderBtn()}
                    <button id="backwardFive" onClick={() => this.changeTime(this.video.current.currentTime - 5)}>Backward</button>
                    <button id="forwardFive" onClick={() => this.changeTime(this.video.current.currentTime + 5)}>Forward</button>
                </React.Fragment>
            )
        }

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
        if (clientRoom.players[clientSess.id].isLeader) {
            clientSess.socket.send(JSON.stringify({ op: 7, d: { code: clientSess.roomCode } }))
        }

        // clear video data from room
        clientRoom.videoTime = 0
        clientRoom.videoUrl = ""
        this.video.current.src = ""
        this.setState({ videoUrl: "" })
        Session.setData(clientSess)
    }



    render() {
        return (
            <div id="customVideoContainer">
                <video
                    id="customVideo"
                    src={this.state.videoUrl}
                    ref={this.video}
                    onEnded={this.videoEnd}
                />
                {this.renderVideoControls()}
            </div>
        )
    }
}