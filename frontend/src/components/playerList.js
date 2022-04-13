import Session from "../sessionManager.js";
import React from "react"
import "./playerList.css"

// TODO: add kick and promote functionality later
export default class PlayerList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            players: {}
        }
    }

    componentDidMount = () => {
        // get players
        let clientSess = Session.getData()
        let clientRoom = clientSess.roomData

        clientRoom.on("playerupdate", () => {
            let roomRef = Session.getData().roomData // idk if clientRoom saves reference to the original cuz im bad at js
            this.setState({ players: roomRef.players })
        })

        this.setState({ players: clientRoom.players })
    }

    renderPlayers = () => {
        let playerList = [<div id="playerTitle">Members</div>] // push divs into here
        let clientSess = Session.getData()

        let i = 0
        for (let pData of Object.values(this.state.players)) {
            let playerName = pData.username

            if (pData.id == clientSess.id) {
                playerName = "You"
            }

            if (pData.isLeader) {
                playerName += " (Leader)"
            }

            playerList.push(<div className="playerListElement" key={i}>{playerName}</div>)
            i++
        }

        return (
            <div id="playersList"> {playerList} </div>
        )
    }

    render() {
        return this.renderPlayers()
    }
}