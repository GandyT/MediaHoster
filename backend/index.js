const Express = require("express")
const App = Express();
App.disable("x-powered-by")

const WS = require("ws");
const path = require("path");

const Cors = require("cors");
const BodyParser = require("body-parser");
const roomManager = require("./websocket/roomManager.js");

/* MIDDLEWARE */
App.use(Cors());
App.use(BodyParser.json());

App.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../frontend/build/index.html"))
})

/* BACKEND ROUTES */
App.use("/api/createroom", require("./routes/createroom.js"));
App.use("/api/roomexists", require("./routes/roomexists.js"));

App.listen(80, () => {
    console.log(`App is running on Port 80`);
});

var wsServer = new WS.Server({ port: process.env.WSPORT || 8080, path: "/websocket" });
wsServer.getUniqueID = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wsServer.on("connection", socket => {
    var validatePayload = { op: 1, t: "SUCCESS", success: true }
    socket.send(JSON.stringify(validatePayload));
    socket.id = wsServer.getUniqueID();
    socket.inRoom = false;

    /* SOCKET HANDLERS */
    socket.on("message", require("./websocket/onmessage.js").bind(socket));
    // already have a socket on close functionality DON'T ADD IT LMFAO YOU WILL DIE
    // check onmessage.js op code 2 to see it xd
});

