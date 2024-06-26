const express = require("express");
const ytdl = require("ytdl-core");

const app = express();
const PORT = 3000;

app.use(express.static('public'));  

app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.send({
    "message": "Test Url",
    "url" : `${baseUrl}/download?url=https://www.youtube.com/watch?v=MkyoQfn-0a0`
  });
});

// http://localhost:3000/download?url=https://www.youtube.com/watch?v=MkyoQfn-0a0
app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send("No URL provided");
  }

  if (!ytdl.validateURL(videoUrl)) {
    return res.status(400).send("Invalid URL");
  }

  try {
    const info = await ytdl.getInfo(videoUrl);

    const videoDetails = {
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      lengthSeconds: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails.sort(
        (a, b) => b.width - a.width
      )[0].url,
    };
    const formats = info.formats.map((format) => ({
      quality: format.qualityLabel,
      container: format.container,
      url: format.url,
    }));

    res.send({
      videoDetails: videoDetails,
      formats: formats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading video");
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
