import React from "react";
import { Navigate } from "react-router-dom"
import Session from "../sessionManager.js"
import "./joinroom.css"

export default class JoinRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            usernameInput: "",
            codeInput: ""
        }
    }

    usernameChange = (e) => {
        if (e.target.value.length > 30) { return }

        this.setState({ usernameInput: e.target.value })
    }

    codeChange = (e) => {
        if (e.target.value.length > 9) return;

        this.setState({ codeInput: e.target.value })
    }

    joinRoom = () => {
        let clientSess = Session.getData()
        clientSess.username = this.state.usernameInput || "Player " + String(Math.floor(Math.random() * 10000)).padStart(5, "0")
        clientSess.roomCode = this.state.codeInput
        Session.setData(clientSess)
        this.setState({ redirect: true })
    }

    redirect = () => {
        if (this.state.redirect) {
            return <Navigate to="/room" />
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.redirect()}
                <div id="joinRoomPage">
                    <div id="homePageTitle" className="floating">Join Room!</div>
                    <div id="joinRoomMain">
                        <input className="createRoomInput" id="joinRoomUsername" value={this.state.usernameInput} placeholder="Username" onChange={this.usernameChange} />
                        <div className="break" />
                        <input className="createRoomInput" id="joinRoomCode" value={this.state.codeInput} placeholder="Room Code" onChange={this.codeChange} />
                        <div className="break" />
                        <button className="homePageBtn" id="joinRoomButton" onClick={this.joinRoom}>Join Room</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}