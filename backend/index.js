const Express = require("express")
const App = Express();
App.disable("x-powered-by")

const WS = require("ws");
const BodyParser = require("body-parser")
const Cors = require("cors")
const Path = require("path")
const Fs = require("fs")

App.use(Cors());
App.use(BodyParser.json())
App.use(BodyParser.urlencoded({ extended: false }))
App.use(Express.static(Path.join(__dirname, "../frontend/build")))

let debugMode = true

const registerRoutes = (path) => {
    var files = Fs.readdirSync(path);

    files.forEach(async file => {
        if (file.toLowerCase().startsWith("template")) return;
        if (file.toLowerCase().startsWith("debug") && !debugMode) return;

        var stat = Fs.statSync(`${path}/${file}`);

        if (stat && stat.isDirectory()) {
            registerRoutes(`${path}/${file}`);
        } else {
            if (file.endsWith(".js")) {
                var routeData = require(`./${path}/${file}`);
                if (debugMode)
                    console.log(`Loaded route api/${routeData.path}`);
                App.use(`/api/${routeData.path.toLowerCase()}`, routeData.router);
            }
        }
    });
}

registerRoutes("routes");



App.listen(80, () => {
    console.log(`App is running on Port 80`);
});