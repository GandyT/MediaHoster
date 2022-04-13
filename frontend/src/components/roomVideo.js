import Session from "../sessionManager.js";
import React from "react"
import "./roomVideo.css"

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
            videoUrl: clientRoom.videoUrl,
            fullscreen: false
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
        clientRoom.on("videoend", this.videoEnd)

        // play video
        this.video.current.currentTime = this.state.videoTime
        if (!this.state.paused) this.video.current.play()

        // fullscreen logic
        document.addEventListener("fullscreenchange", event => {
            if (!document.fullscreenElement) {
                this.setState({ fullscreen: false })
            }
        });
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

    /* 
    this is kinda iffy, it might break stuff but it should increase efficiency
    shouldComponentUpdate = (nextProps) => {
        return false
    }
    */

    videoEnd = () => {
        console.log("VIDEO ENDED")
        let clientSess = Session.getData()

        // clear video data from room
        this.video.current.src = ""
        this.setState({ videoUrl: "", videoTime: 0 })
        Session.setData(clientSess)
    }

    isClientLeader = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        return clientRoom.players[clientSess.id].isLeader
    }

    renderVideo = () => {
        return (
            <video
                src={this.state.videoUrl}
                controls={false}
                id={this.state.fullscreen ? "fullscreenVideo" : "customVideo"}
                ref={this.video}
                onEnded={() => {
                    let clientSess = Session.getData()
                    // IF CLIENT IS LEADER, SEND WS PAYLOAD - video ended
                    if (this.isClientLeader()) {
                        clientSess.socket.send(JSON.stringify({ op: 7, d: { code: clientSess.roomCode } }))
                    }
                    this.videoEnd()
                }}
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
            >
            </video>
        )
    }

    renderVideoControls = () => {
        // 3 vid control btns, skip 5 sec back, play/pause, 5 sec forward, + time line + fullscreen btn
        const renderPlayPause = () => {
            if (this.state.paused) {
                // put play
                return <button className="videoControlBtn" id="play" onClick={() => { if (this.isClientLeader()) this.video.current?.play() }} />
            } else {
                // put pause
                return <button className="videoControlBtn" id="pause" onClick={() => { if (this.isClientLeader()) this.video.current?.pause() }} />
            }
        }

        return (
            <div id={this.state.fullscreen ? "videoControlsFull" : "videoControls"}>
                <button className="videoControlBtn" id="skipBack" onClick={() => { if (this.isClientLeader()) this.changeTime(this.video.current.currentTime - 5) }} />
                {renderPlayPause()}
                <button className="videoControlBtn" id="skipForward" onClick={() => { if (this.isClientLeader()) this.changeTime(this.video.current.currentTime + 5) }} />
                <div id="progressBarContainer">
                    <div id="progress" style={{ width: `${(this.video.current?.currentTime / this.video.current?.duration) * 100 || 0}%` }}></div>
                </div>
                <button className="videoControlBtn" id="fullscreen" onClick={() => {
                    let newFullScreen = !this.state.fullscreen

                    if (newFullScreen) {
                        document.documentElement.requestFullscreen()
                    } else {
                        document.exitFullscreen()
                    }

                    this.setState({ fullscreen: newFullScreen })
                }} />
            </div>
        )
    }

    render() {
        return (
            <div id={this.state.fullscreen ? "fullscreenVideoContainer" : "customVideoContainer"}>
                {this.renderVideo()}
                {this.renderVideoControls()}
            </div>
        )
    }
}