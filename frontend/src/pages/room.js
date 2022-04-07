import React from "react";
import Session from "../sessionManager.js";
import { Navigate } from "react-router-dom"
import * as Axios from "axios";
import RoomClass from "../room.js"

class RoomVideo extends React.Component {
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

    render() {
        return (
            <div id="customVideoContainer">
                <video
                    id="customVideo"
                    src={this.src}
                    ref={this.video}
                />
                {this.renderVideoControls()}
            </div>
        )
    }
}

export default class Room extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            redirect: false,
        }
    }

    redirect = () => {
        if (this.state.redirect) { // kick out to home
            return <Navigate to="/" />
        }
    }

    componentDidMount = async () => {
        let sess = Session.getData();
        // check if saved room exists first
        let roomStatus = await Axios.post("api/roomexists", { code: sess.roomCode });

        if (!roomStatus.data.exists) {
            console.log("Invalid Room Code");
            this.setState({ redirect: true });
            return;
        }

        let ws = sess.socket;

        // new onclose logic, new on open logic
        ws.onclose = () => {
            this.setState({ redirect: true });
            sess.roomCode = "";
            sess.socket = "";
            Session.setData(sess);
        }

        ws.onmessage = payload => {
            let data = JSON.parse(payload.data)
            let op = data.op
            let d = data.d
            let clientSess = Session.getData()

            if (op == 6) {
                // ROOM_JOIN DATA
                let clientId = d.id
                let clientRoom = new RoomClass()
                clientRoom.players = d.players
                clientRoom.paused = d.paused
                clientRoom.videoTime = d.videoTime
                clientRoom.videoUrl = d.videoUrl
                clientRoom.roomCode = clientSess.roomCode

                clientSess.id = clientId
                clientSess.roomData = clientRoom
                Session.setData(clientSess)

                // set video logic, set room events
                clientRoom.on("")

                // finish loading at the end
                this.setState({ loading: false })
            }

            console.log(data)
        }

        // join room and update sess, loading for now
        ws.send(JSON.stringify({ op: 2, d: { username: sess.username, code: sess.roomCode } }))
    }

    componentWillUnmount = () => {
        console.log("Leaving Room");
        // remove code and leave
        let sess = Session.getData();
        let ws = sess.socket;

        if (ws)
            ws.send(JSON.stringify({ op: 3, d: { code: sess.roomCode } })); // send socket to leave room

        sess.roomCode = "";
        Session.setData(sess);
    }

    // these two just use websocket to send pause and unpause payloads
    onPause = () => {

    }

    onUnpause = () => {

    }

    renderPage = () => {
        if (this.state.loading) {
            return <div className="LoadingScreen">Loading</div>
        } else {
            // actual page
            return (
                <div id="roomPage">
                    <RoomVideo onPause={this.onPause} onUnpause={this.onUnpause} />
                </div>
            )
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.redirect()}
                {this.renderPage()}
            </React.Fragment>
        )
    }
}