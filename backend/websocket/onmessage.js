function onmessage(payload) {
    const socket = this;
    const playerId = socket.id;
    var data = JSON.parse(payload);
    var op = data.op;

   if (op == 1) {
       // create room
       
   }
}

module.exports = onmessage;