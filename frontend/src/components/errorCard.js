import React from "react"

// error drop down thingy that disappears by itself after a while

export default class ErrorCard extends React.Component {
    constructor(props) {
        super(props)
        this.error = props.error
        this.onDelete = props.onDelete
    }

    componentDidMount = () => {
        setTimeout(() => { this.onDelete() }, 5000)
    }

    render() {
        return <div className="errorCard">{this.error}</div>
    }
}