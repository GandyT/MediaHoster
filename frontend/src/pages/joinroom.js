import React from "react";
import { Navigate } from "react-router-dom"

export default class JoinRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false
        }
    }

    redirect = () => {
        if (this.state.redirect) {
            return <Navigate to="/room" />
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="joinRoomPage">

                </div>
            </React.Fragment>
        )
    }
}