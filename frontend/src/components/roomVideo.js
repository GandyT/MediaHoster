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

        this.state = {
            paused: clientRoom.paused,
            videoTime: clientRoom.videoTime || 0,
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
        clientRoom.on("unpause", this.unpause)
        clientRoom.on("ontimechange", this.onTimeChange)
        clientRoom.on("onurlchange", this.onUrlChange)

        // play video
        if (!this.state.paused) this.video.current.play()
    }

    /*  
    // debug
    componentDidUpdate = () => {
        console.log(this.state)
    }
    */

    pause = () => {
        this.video.current.pause()
        this.setState({ paused: true })
    }

    unpause = () => {
        this.video.current.play()
        this.setState({ paused: false })
    }

    onTimeChange = (newTime) => {
        this.video.current.currentTime = newTime
        this.setState({ videoTime: newTime })

    }

    onUrlChange = (url) => {
        this.video.current.src = url
        this.video.current.currentTime = 0
        this.setState({ videoUrl: url, videoTime: 0 })
    }

    renderVideoControls = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        let renderBtn = () => {
            if (!clientRoom.players[clientSess.id].isLeader) return; // if client isn't leader, no video controls
            if (this.state.paused) {
                return <div id="playBtn" onClick={this.onUnpause}></div>
            } else {
                return <div id="pauseBtn" onClick={this.onPause}></div>
            }
        }

        return (
            <div id="customVideoControls">
                {renderBtn()}
                <div id="videoTime">{this.state.videoTime}</div>
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
        Session.setData(clientRoom)
    }

    render() {
        return (
            <div id="customVideoContainer">
                <video
                    id="customVideo"
                    src={this.src}
                    ref={this.video}
                    onEnded={this.videoEnd}
                />
                {this.renderVideoControls()}
            </div>
        )
    }
}