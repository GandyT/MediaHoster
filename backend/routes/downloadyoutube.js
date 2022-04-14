const Express = require("express");
const Router = Express.Router();
const Fs = require("fs")
const path = require("path")
const YTDL = require("ytdl-core")

Router.post("/", async (req, res) => {
    // check if youtubevideos folder already has the link
    // if not, then download the youtube video, save it
    // return to sender the relative path to the file so then they can create the absolute link themselves


    let youtubeUrl = req.body.youtubeUrl;
    if (!youtubeUrl) return res.send({ success: false })

    let youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/ // obviously stolen from the internet
    if (!youtubeRegex.test(youtubeUrl)) return res.send({ success: false })

    let youtubeId = youtubeUrl.slice(youtubeUrl.indexOf("=") + 1);
    let relativePath = `youtubevideos/${youtubeId}.mp4`;

    let videoPath = path.join(__dirname, "../" + relativePath)
    if (Fs.existsSync(videoPath))
        return res.send({ success: true, path: relativePath })

    // download video
    let youtubeData = YTDL(youtubeUrl)
    youtubeData.pipe(Fs.createWriteStream(videoPath))
    youtubeData.on("finish", () => {
        console.log("DONE DOWNLOAD")
        return res.send({ success: true, path: relativePath })
    })
});

module.exports = Router;