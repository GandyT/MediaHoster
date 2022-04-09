import React from "react";
import Session from "../sessionManager.js";
import { Navigate } from "react-router-dom"
import * as Axios from "axios";
import RoomClass from "../room.js"
import RoomVideo from "../components/roomVideo.js"
import PlayerList from "../components/playerList.js"
import ErrorCard from "../components/errorCard.js"

// bug when changing url video doesn't play

export default class Room extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            redirect: false,
            urlInput: "",
            error: false
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
            let clientRoom = clientSess.roomData

            // parse actions
            if (op == 6) {
                // ROOM_JOIN DATA
                let clientId = d.id
                clientRoom = new RoomClass()
                clientRoom.players = d.players
                clientRoom.paused = d.paused
                clientRoom.videoTime = d.videoTime
                clientRoom.videoUrl = d.videoUrl
                clientRoom.roomCode = clientSess.roomCode

                clientSess.id = clientId
                clientSess.roomData = clientRoom
                Session.setData(clientSess)

                // finish loading at the end
                this.setState({ loading: false })
            } else if (op == 3) {
                // player join
                clientRoom.addPlayer(d.id, d.username)
            } else if (op == 4) {
                // player left
                clientRoom.removePlayer(d.id)
            } else if (op == 5) {
                // leadership change
                clientRoom.removeLeader()
                clientRoom.setLeader(d.id)
            } else if (op == 7) {
                // pause update
                let isPause = d.paused

                if (isPause) {
                    clientRoom.pause()
                } else {
                    clientRoom.unpause()
                }
            } else if (op == 8) {
                // video update
                clientRoom.changeUrl(d.url)
            } else if (op == 9) {
                console.log("Host video has ended...")
            } else if (op == 10) {
                // video time update
                clientRoom.changeTime(d.videoTime)
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
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData
        clientRoom.pause()
        let ws = clientSess.socket
        ws.send(JSON.stringify({ op: 4, d: { code: clientSess.roomCode } }))
    }

    onUnpause = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        clientRoom.unpause()
        let ws = clientSess.socket
        ws.send(JSON.stringify({ op: 5, d: { code: clientSess.roomCode } }))
    }

    changeUrl = () => {
        let clientSess = Session.getData()
        let ws = clientSess.socket

        /* ERROR CHECKS FOR CURRENT URL HERE */
        if (!this.state.urlInput) {
            return this.setState({ error: "Invalid Url" })
        }
        /* ==================================== */

        // send websocket payload
        ws.send(JSON.stringify({ op: 6, d: { code: clientSess.roomCode, url: this.state.urlInput } }))
    }

    onUrlChange = (e) => {
        this.setState({ urlInput: e.target.value })
    }

    renderUrlInput = () => {
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        if (clientRoom.players[clientSess.id].isLeader)
            return (
                <div id="urlInputCont">
                    <input id="urlInput" placeholder="enter a url" onChange={this.onUrlChange} value={this.state.urlInput} />
                    <button onClick={this.changeUrl}>Change Url</button>
                </div>
            )
    }

    renderError = () => {
        if (this.state.error)
            return <ErrorCard error={this.state.error} onDelete={() => { this.setState({ error: "" }) }} />
    }

    renderPage = () => {
        if (this.state.loading) {
            return <div className="LoadingScreen">Loading</div>
        } else {
            // actual page
            return (
                <React.Fragment>
                    {this.renderError()}
                    <div id="roomPage">
                        <div id="roomData">
                            <div id="roomCode">{Session.getData().roomData.roomCode}</div>
                        </div>
                        <RoomVideo onPause={this.onPause} onUnpause={this.onUnpause} />
                        <PlayerList />
                        {this.renderUrlInput()}
                    </div>
                </React.Fragment>
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