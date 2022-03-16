let fs = require("fs");
let path = require("path");
let bossListPath = path.join(__dirname, "../../bossList.json");
let bossList = JSON.parse(fs.readFileSync(bossListPath));
module.exports = {
  bossList: bossList,
  data: {
    startTimeStamp: 0,
    startTime: "",
    timeDurationStr: "",
    timeDurationStamp: 0,
    stops: [],
    paused: false,
    started: false,
    guilds: {},
  },
};
