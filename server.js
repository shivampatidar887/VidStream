const express = require('express');
const app = express();
const fs = require('fs');
const multer  = require('multer');

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });

app.get('/', function(req, res){
  res.sendFile(__dirname+ "/index.html");
})

app.post('/upload', upload.single('video'), function(req, res, next) {
  const videoPath = req.file.path;
  res.send('File uploaded successfully!');
});

// stream video
app.get('/video', function(req, res){
  const range = req.headers.range;
  if(!range){
    res.status(400).send("Requires Range header");
  }
  // get the video file path from the database, assuming it was saved during upload
  const videoPath = "sample.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10**6; //1 MB
  const start = Number(range.replace(/\D/g, "")); 
  const end = Math.min(start + CHUNK_SIZE , videoSize-1);
  const contentLength = end-start+1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": 'bytes',
    "Content-Length": contentLength,
    "Content-Type": "video/mp4"
  }
  res.writeHead(206,headers);
  const videoStream = fs.createReadStream(videoPath,{start, end});
  videoStream.pipe(res);
});

// New API endpoint for downloading the video file
app.get('/download', function (req, res) {
  const videoPath = "uploads/sample.mp4"; // Update with the correct video file path
  res.download(videoPath, 'sample.mp4'); 
});

app.listen(4000, function () {
  console.log("Server is running on port:", 4000);
});

