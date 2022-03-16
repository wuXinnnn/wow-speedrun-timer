let express = require("express");
let global = require("./global.js");
let outputServer = new express();
outputServer.get("/", function (req, res) {
  console.log(req.method);
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(global.data, null, 2));
});

module.exports = outputServer;
