let path = require("path");
let global = require("./scripts/modules/global");
let express = require("express");
// let server = require("./scripts/modules/server");
let server = new express();
server.get("/", function (req, res) {
  console.log(req.method);
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(global.data, null, 2));
});

server.get("/timeLine", function (req, res) {
  console.log(req.method);
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(global.data.guilds, null, 2));
});

server.get("/mapSim", function (req, res) {
  console.log(req.method);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(fs.readFileSync(path.join(__dirname, "/mapSim/index.html")));
});

server.use("/styles", express.static(__dirname + "/mapSim/styles"));
server.use("/scripts", express.static(__dirname + "/mapSim/scripts"));
server.use("/bossAvatars", express.static(__dirname + "/mapSim/bossAvatars"));
server.use("/teamLogoes", express.static(__dirname + "/mapSim/teamLogoes"));
server.use("/map.png", express.static(__dirname + "/mapSim/map.png"));

let events = require("events");
let fs = require("fs");
let ipcRenderer = require("electron").ipcRenderer;
let gEvent = new events();
let globalInterval;
let stopers = [];
let autoSaveInterval;
server.listen(9153, function () {
  console.log("竞速计时器服务启动成功，端口为9153");
});

let contentContainer = document.getElementById("contentContainer");
let guildContents = document.getElementsByClassName("content");
let guildBossesFrames = document.getElementsByClassName(
  "guild-bosses-container"
);
let totalTimerView = document.getElementsByClassName("total-timer-view")[0];
let TotalStartButton = document.getElementById("TotalStart");
let TotalStopButton = document.getElementById("TotalStop");
let TotalResetButton = document.getElementById("TotalReset");
let TotalReadyButton = document.getElementById("TotalReady");
let addButton = document.getElementById("addButton");
let reduceButton = document.getElementById("reduceButton");

let globalReady = () => {
  let safeCheck = true;
  let safeCheckArray = [];
  let guidNameEls = document.getElementsByTagName("input");
  for (let index = 0; index < guidNameEls.length; index++) {
    if (!guidNameEls[index].value) {
      safeCheck = false;
      safeCheckArray.push(index);
    }
  }
  if (!safeCheck) {
    gEvent.emit("safeCheckFailed", safeCheckArray);
    return;
  }
  for (let index = 0; index < guildContents.length; index++) {
    let guildName = guildContents[index].getElementsByTagName("input")[0].value;
    let guildObj = {};
    guildObj = {
      guildName: guildName,
      guildPic: guildName + ".png",
      timeLine: [],
      guildId: index,
    };
    global.bossList.forEach((boss) => {
      let bossObj = {
        bossName: boss.bossName,
        finished: false,
        finishedTimeStr: "",
        finishedTimeStamp: "",
      };
      guildObj.timeLine.push(bossObj);
    });
    global.data.guilds[guildName] = guildObj;
  }
  TotalReadyButton.classList.add("is-disabled");
  addButton.style = "display:none";
  reduceButton.style = "display:none";
  TotalStartButton.classList.remove("is-disabled");
  TotalStopButton.classList.remove("is-disabled");
  TotalResetButton.classList.remove("is-disabled");
  autoSaveInterval = setInterval(() => {
    saveGlobal("autoSave", "autoSave", path.join(__dirname, "last.json"));
  }, 10000);
};

let globalTimerStart = () => {
  let timeNow = new Date();
  global.data.startTimeStamp = timeNow.valueOf();
  global.data.startTime = getTimeByValue(
    global.data.startTimeStamp,
    "/",
    " ",
    ":"
  );
  totalTimerView.textContent = "00:00:00";
  globalInterval = setInterval(timerNow, 1000);
  global.data.started = true;
  gEvent.emit("started");
  TotalStartButton.classList.add("is-disabled");
  TotalResetButton.classList.add("is-disabled");
};

let globalTimerPauseRe = () => {
  let timeNow = new Date();
  let timeNowStamp = timeNow.valueOf();
  if (global.data.paused) {
    global.data.stops[global.data.stops.length - 1][1] = timeNowStamp;
    global.data.paused = false;
    gEvent.emit("allStopShow");
    TotalResetButton.classList.add("is-disabled");
  } else {
    global.data.stops[global.data.stops.length] = [timeNowStamp];
    global.data.paused = true;
    gEvent.emit("allStopHide");
    TotalResetButton.classList.remove("is-disabled");
  }
};

let timerNow = () => {
  let timeNow = new Date();
  if (global.data.paused) {
    timeNow = global.data.stops[global.data.stops.length - 1][0];
  } else {
    timeNow = new Date();
  }
  let timeNowStamp = timeNow.valueOf();
  let timeDurationStamp = timeNowStamp - global.data.startTimeStamp;
  global.data.stops.forEach((stop) => {
    if (stop.length == 2) {
      timeDurationStamp = timeDurationStamp - (stop[1] - stop[0]);
    }
  });
  let timeDurationStr = timeDuration(timeDurationStamp);
  global.data.timeDurationStamp = timeDurationStamp;
  global.data.timeDurationStr = timeDurationStr;
  totalTimerView.textContent = timeDurationStr;
};

let globalIni = () => {
  clearInterval(autoSaveInterval);
  allStopHide();
  clearInterval(globalInterval);
  totalTimerView.textContent = "";
  let allStopView = document.getElementsByClassName("guild-boss-timer-view");
  for (let index = 0; index < allStopView.length; index++) {
    allStopView[index].textContent = "";
  }
  global.data = {
    startTimeStamp: 0,
    startTime: "",
    timeDurationStr: "",
    timeDurationStamp: 0,
    stops: [],
    paused: false,
    guilds: {},
  };
  TotalReadyButton.classList.remove("is-disabled");
  addButton.style = "";
  reduceButton.style = "";
  TotalStartButton.classList.add("is-disabled");
  TotalStopButton.classList.add("is-disabled");
  TotalResetButton.classList.add("is-disabled");
};

let timeToSeconds = (t) => {
  let durationStamp = new Date(t);
  let hours = durationStamp.getHours() - 8;
  let minutes = durationStamp.getMinutes();
  let seconds = durationStamp.getSeconds();
  if (hours <= 0) {
    hours = 0;
  }
  seconds = hours * 3600 + minutes * 60 + seconds;
  return seconds;
};

let timeDuration = (t) => {
  let durationStamp = new Date(t);
  let hours = durationStamp.getHours() - 8;
  if (hours < 10) {
    hours = "0" + hours + ":";
  } else {
    hours = hours + ":";
  }
  let minutes = durationStamp.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes + ":";
  } else {
    minutes = minutes + ":";
  }
  let seconds = durationStamp.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let duration = hours + minutes + seconds;
  return duration;
};

let bossStop = (viewEl) => {
  let guildName =
    viewEl.parentNode.parentNode.parentNode.getElementsByTagName("input")[0]
      .value;
  let timeStrNow = global.data.timeDurationStr;
  let timeStampNow = global.data.timeDurationStamp;
  let bossIndex = viewEl.getAttribute("bossId");
  global.data.guilds[guildName].timeLine[bossIndex].finishedTimeStamp =
    timeStampNow;
  global.data.guilds[guildName].timeLine[bossIndex].finishedTimeStr =
    timeStrNow;
  global.data.guilds[guildName].timeLine[bossIndex].finished = true;
  viewEl.textContent = timeStrNow;
};

// let globalUpdate = () => {
//   global.data = global.dataCache;
// };

let getTimeByValue = (t, YMD, DH, HMS) => {
  var date = new Date(t);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var currentDate =
    year + YMD + month + YMD + day + DH + hours + HMS + minutes + HMS + seconds;
  return currentDate;
};

let getTime = (YMD, DH, HMS) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var currentDate =
    year + YMD + month + YMD + day + DH + hours + HMS + minutes + HMS + seconds;
  return currentDate;
};

let loadPreset = (e, filePath) => {
  let globalBackup = JSON.parse(JSON.stringify(global));
  try {
    let globalRead = JSON.parse(fs.readFileSync(filePath));
    global = globalRead;
    let globalCache = JSON.parse(JSON.stringify(global));
    stopers.forEach((BossStopers) => {
      BossStopers.forEach((stoper) => {
        stoper.removeEventListener("change", timerStopCallback);
      });
    });
    stopers = [];
    contentContainer.innerHTML = "";
    let guildsSort = [];
    for (
      let index = 0;
      index < Object.keys(globalCache.data.guilds).length;
      index++
    ) {
      let guildName = Object.keys(globalCache.data.guilds)[index];
      guildsSort[globalCache.data.guilds[guildName].guildId] = guildName;
    }
    for (let index = 0; index < guildsSort.length; index++) {
      let guildName = guildsSort[index];
      guildBossListCreator(index);
      document.getElementsByTagName("input")[index].value = guildName;
      globalCache.data.guilds[guildName].timeLine.forEach((boss, bossIndex) => {
        if (boss.finished) {
          document.getElementsByClassName("guild-boss-timer-view")[
            bossIndex +
              index * globalCache.data.guilds[guildName].timeLine.length
          ].textContent = boss.finishedTimeStr;
        }
      });
      if (globalCache.data.started) {
        if (globalInterval != null) {
          clearInterval(globalInterval);
        }
        if (autoSaveInterval != null) {
          clearInterval(autoSaveInterval);
        }
        TotalReadyButton.classList.add("is-disabled");
        addButton.style = "display:none";
        reduceButton.style = "display:none";
        TotalStartButton.classList.add("is-disabled");
        TotalStopButton.classList.remove("is-disabled");
        TotalResetButton.classList.add("is-disabled");
        let timeCur = new Date();
        autoSaveInterval = setInterval(() => {
          saveGlobal("autoSave", "autoSave", path.join(__dirname, "last.json"));
        }, 10000);
        if (!globalCache.data.paused && globalCache.data.started) {
          let durationStampCur = timeCur - globalCache.data.startTimeStamp;
          globalCache.data.stops.forEach((stop) => {
            durationStampCur = durationStampCur - stop[1] + stop[0];
          });
          totalTimerView.textContent = timeDuration(durationStampCur);
        }
        globalInterval = setInterval(timerNow, 1000);
        gEvent.emit("started");
        if (globalCache.data.paused) {
          totalTimerView.textContent = globalCache.data.timeDurationStr;
          gEvent.emit("allStopHide", allStopHide);
          TotalResetButton.classList.remove("is-disabled");
        }
      }
    }
  } catch (error) {
    console.log(error);
    if (e != "loadLast") {
      gEvent.emit("errorModalShow", [
        "Invalid Preset File <span>QAQ</span>",
        "upload",
      ]);
      global = globalBackup;
      GuildFrameIni();
      globalIni();
    }
  }
};

let saveGlobal = (event, type, fileUrl) => {
  let saveName;
  let saveUrl;
  if (!fileUrl) {
    saveName = "./" + getTime("-", "-", "-") + ".json";
    saveUrl = path.join(__dirname, saveName);
  } else {
    saveUrl = fileUrl;
  }
  try {
    fs.writeFileSync(saveUrl, JSON.stringify(global, null, 2));
  } catch (error) {
    console.error(error);
  }

  console.log("save success");
  if (type == "quit") {
    ipcRenderer.send("can-quit");
  }
};

gEvent.on("TotalStart", globalTimerStart);
gEvent.on("TotalStop", globalTimerPauseRe);
gEvent.on("TotalReset", globalIni);
gEvent.on("TotalReady", globalReady);
gEvent.on("stopClick", bossStop);
gEvent.on("loadPreset", loadPreset);
// gEvent.on("saveGlobal", saveGlobal);
// gEvent.on("globalUpdate", globalUpdate);
ipcRenderer.on("saveGlobal", saveGlobal);
ipcRenderer.on("loadPreset", loadPreset);
