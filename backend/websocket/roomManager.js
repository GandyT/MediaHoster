const Room = require("./room.js");
let rooms = [];

module.exports = {
    createRoom: () => {
        let newRoom = new Room();

        rooms.push(newRoom);

        return newRoom.code;
    },
    getRoom: (code) => {
        return rooms.find(r => r.code == code);
    },
    removeRoom: (code) => {
        rooms = rooms.filter(r => r.code != code);
    }
}