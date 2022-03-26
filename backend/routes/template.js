const Express = require("express");
const Router = Express.Router();

Router.post("/", async (req, res) => {
    var requestIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    var args = Decrypt(req.body);
    var query = req.query; // query string
});

module.exports = {
    path: "template",
    router: Router
}