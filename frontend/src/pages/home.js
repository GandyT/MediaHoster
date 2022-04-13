import React from "react";
import Session from "../sessionManager.js";
import { Navigate } from "react-router-dom";
import "./home.css"

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.createRoomPath = "/createroom"
        this.joinRoomPath = "/joinroom"
        this.state = {
            roomCode: "",
            redirectTo: "",
            error: ""
        }
    }

    redirect = () => {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }
    }
    /* 
    changeCode = (e) => {
        let lastChar = e.target.value[e.target.value.length - 1]
        if (e.target.value.length > 9) return;
        if (lastChar == " ") return;
        if (e.target.value.length && isNaN(lastChar)) return;

        let oldSess = Session.getData();
        oldSess.roomCode = this.state.roomCode;
        Session.setData(oldSess);
        this.setState({ roomCode: e.target.value });
    }
    */

    render() {
        return (
            <React.Fragment>
                {this.redirect()}
                <div id="homePage">
                    <div id="homePageTitle" className="floating">MediaParty!</div>
                    <div id="homePageBtns">
                        <button className="homePageBtn" onClick={(e) => {
                            if (Session.getData().socket) {
                                this.setState({ redirectTo: this.createRoomPath })
                            } else {
                                this.setState({ error: "Internal Error" })
                            }
                        }}>Create Room</button>
                        <div id="homeJoinBtns">
                            {/*<input value={this.state.roomCode} onChange={this.changeCode} placeholder="Room Code" /> */}
                            <button className="homePageBtn" onClick={(e) => {
                                if (Session.getData().socket) {
                                    this.setState({ redirectTo: this.joinRoomPath })
                                } else {
                                    this.setState({ error: "Internal Error" })
                                }
                            }}>Join Room</button>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    componentDidMount = () => {
        console.log("home page loaded")
        const setup = () => {

            const ws = new WebSocket(`ws://${window.location.hostname}:8080/websocket`);

            ws.onopen = () => {
                let oldSess = Session.getData();
                oldSess.socket = ws;
                Session.setData(oldSess);
            }

            ws.onclose = () => {
                let oldSess = Session.getData();
                oldSess.socket = "";
                Session.setData(oldSess);
                setTimeout(() => setup(), 100)
            }; // add a timer to prevent spamming server
        }

        setup();
    }
}