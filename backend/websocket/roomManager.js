const Room = require("./room.js");
let rooms = [];

module.exports = {
    createRoom: () => {
        let newRoom = new Room();
        
        rooms.push(newRoom);

        return newRoom.code;
    },
    getRoom: (id) => {
        return rooms.find(r => r.id == id);
    },
    removeRoom: (id) => {
        rooms = rooms.filter(r => r.id != id);
    }
}