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

