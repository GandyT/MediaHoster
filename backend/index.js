const Express = require("express")
const App = Express();
App.disable("x-powered-by")

const WS = require("ws");
const path = require("path");

App.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../frontend/build/index.html"))
})

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

    /* SOCKET HANDLERS */
    socket.on("message", require("./websocket/onmessage.js").bind(socket));
});

