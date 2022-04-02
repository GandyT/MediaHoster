let session = {
    username: "",
    roomCode: "",
    socket: "",
    id: ""
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