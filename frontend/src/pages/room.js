import React from "react";
import Session from "../sessionManager.js";
import { Navigate } from "react-router-dom"
import * as Axios from "axios";

export default class Room extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            redirect: false
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

    renderPage = () => {
        if (this.state.loading) {
            return <div className="LoadingScreen">Loading</div>
        } else {
            // actual page
            return (
                <div id="roomPage"></div>
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