import React from "react";
import Session from "../sessionManager.js";
import { Navigate } from "react-router-dom"
import * as Axios from "axios";
import "./createroom.css"

export default class CreateRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            redirect: false,
            error: ""
        }
    }

    componentDidMount = () => {
        let sess = Session.getData();
        this.setState({ username: sess.username });
    }

    redirect = () => {
        if (this.state.redirect) {
            return <Navigate to="/room" />
        }
    }

    usernameChange = (e) => {
        if (e.target.value.length > 30)
            return

        this.setState({ username: e.target.value })
    }

    createRoom = () => {
        let username = this.state.username || "Player " + String(Math.floor(Math.random() * 10000)).padStart(5, "0")
        let sess = Session.getData();

        sess.username = username;

        // send roomCreate post request
        Axios.post("api/createroom")
            .then(res => {
                if (!res.data.success) {
                    this.setState({ error: "Internal Error" });
                    return;
                }

                let roomCode = res.data.code
                console.log(`Created Room: code - ${roomCode}`)
                sess.roomCode = roomCode
                Session.setData(sess)
                this.setState({ redirect: true });
            });
    }

    render() {
        return (
            <React.Fragment>
                {this.redirect()}
                <div id="createRoomPage">
                    <div id="homePageTitle" className="floating">Create Room!</div>
                    <div id="createRoomMain">
                        <input className="createRoomInput" placeholder="username" onChange={this.usernameChange} onFocus={(e) => { this.setState({ error: "" }) }} />
                        <button className="homePageBtn" onClick={this.createRoom}>Create Room</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}