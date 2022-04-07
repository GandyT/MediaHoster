let session = {
    username: "",
    roomCode: "",
    socket: "",
    id: "",
    roomData: ""
}

let Session = {
    getData() {
        return session;
    },
    setData(data) {
        session = data;
    }
}

export default Session;