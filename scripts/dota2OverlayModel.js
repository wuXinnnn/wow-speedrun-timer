var d2gsi = require("./scripts/cdota2-gsi");
var server = new d2gsi();
var http = require("http");
var WebSocket = require("ws");
var path = require("path");
var ipc = require("electron").ipcRenderer;
var fs = require("fs");
var path = require("path");
var formatJson = require("format-json-pretty");
const { send } = require("process");
var elRemote = require("electron").remote;
var damageTotal = {};
var outputData = {};
var playerAmount = 0;
var backUpData = {};
var teamHeroesData = {};
let afterMatchPlayBtn = document.getElementById("afterMatch-Play");
let afterMatchFinishBtn = document.getElementById("afterMatch-Finish");
var inGameOverlayList = ["teamContrast", "winRate"];
var wsFunction = {};
var inGameBtns = ["preview", "play", "finish"];
var afterMatchList = ["afterMatch"];
var afterMatchBtns = ["play", "finish"];
var overlayPath = path.join(__dirname, "./overlay");
var heroesDataPath = path.join(__dirname, "./herodata.json");
var previewTimeOutList = [];
var heroesData = JSON.parse(fs.readFileSync(heroesDataPath, "utf-8"));
var heroDataTemplate = {
  baofa: 0,
  kongzhi: 0,
  taosheng: 0,
  tuijin: 0,
  xianshou: 0,
};
server.events.on("newclient", function (client) {
  var server = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:

    console.log(request.method + ": " + request.url);
    // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
    response.writeHead(200, { "Content-Type": "application/json" });
    // 将HTTP响应的HTML内容写入response:
    response.end(JSON.stringify(client.gamestate, null, 2));
  });
  // 让服务器监听8080端口:
  server.listen(8188);

  console.log("gsiServer is running at http://127.0.0.1:8188/");
  var outputServer = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:

    console.log(request.method + ": " + request.url);
    // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
    response.writeHead(200, { "Content-Type": "application/json" });
    // 将HTTP响应的HTML内容写入response:
    response.end(JSON.stringify(client.outputData, null, 2));
  });
  // 让服务器监听8080端口:
  outputServer.listen(8288);

  console.log("outputServer is running at http://127.0.0.1:8288/");

  var teamHeroesServer = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:

    console.log(request.method + ": " + request.url);
    // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
    response.writeHead(200, { "Content-Type": "application/json" });
    // 将HTTP响应的HTML内容写入response:
    response.end(JSON.stringify(teamHeroesData, null, 2));
  });
  // 让服务器监听8080端口:
  teamHeroesServer.listen(8388);

  console.log("teamHeroesServer is running at http://127.0.0.1:8388/");
  // console.log("New client connection, IP address: " + client.ip + ", Auth token: " + client.auth);

  var wsInGameServer = new WebSocket.Server({ port: 8588 });

  wsInGameServer.on("open", function open() {
    console.log("connected");
  });

  wsInGameServer.on("close", function close() {
    console.log("disconnected");
  });

  wsInGameServer.on("connection", function connection(ws, req) {
    var ip = req.connection.remoteAddress;
    var port = req.connection.remotePort;
    var clientName = ip + port;
  });
  var overlayInGameServer = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:

    console.log(request.method + ": " + request.url);
    // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
    // 将HTTP响应的HTML内容写入response:
    switch (request.url) {
      case "/":
      case "/favicon.ico":
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(fs.readFileSync(overlayPath + "/overlay-inGame.html"));
        break;
      case "/styles/after-match-global.css":
      case "/styles/inGame-global.css":
      case "/styles/fonts.css":
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
      default:
        response.writeHead(200);
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
        break;
    }
  });
  // 让服务器监听8080端口:
  overlayInGameServer.listen(8688);

  console.log("overlayInGameServer is running at http://127.0.0.1:8688/");

  var wsAfterMatchServer = new WebSocket.Server({ port: 8788 });

  wsAfterMatchServer.on("open", function open() {
    console.log("connected");
  });

  wsAfterMatchServer.on("close", function close() {
    console.log("disconnected");
  });

  wsAfterMatchServer.on("connection", function connection(ws, req) {
    var ip = req.connection.remoteAddress;
    var port = req.connection.remotePort;
    var clientName = ip + port;

    console.log("%s is connected", clientName);
  });

  var overlayAfterMatchServer = http.createServer(function (request, response) {
    console.log(request.method + ": " + request.url);
    switch (request.url) {
      case "/":
      case "/favicon.ico":
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(
          fs.readFileSync(overlayPath + "/overlay-after-match.html")
        );
        break;
      case "/styles/after-match-global.css":
      case "/styles/inGame-global.css":
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
      default:
        response.writeHead(200);
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
        break;
    }
  });
  // 让服务器监听8080端口:
  overlayAfterMatchServer.listen(8888);

  console.log("overlayAfterMatchServer is running at http://127.0.0.1:8888/");

  var wsPreviewServer = new WebSocket.Server({ port: 8910 });

  wsPreviewServer.on("open", function open() {
    console.log("connected");
  });

  wsPreviewServer.on("close", function close() {
    console.log("disconnected");
  });

  wsPreviewServer.on("connection", function connection(ws, req) {
    var ip = req.connection.remoteAddress;
    var port = req.connection.remotePort;
    var clientName = ip + port;

    console.log("%s is connected", clientName);
  });

  var overlayPreviewServer = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:

    console.log(request.method + ": " + request.url);
    // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
    // 将HTTP响应的HTML内容写入response:
    switch (request.url) {
      case "/":
      case "/favicon.ico":
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(fs.readFileSync(overlayPath + "/overlay-preview.html"));
        break;
      case "/styles/after-match-global.css":
      case "/styles/inGame-global.css":
      case "/styles/fonts.css":
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
      default:
        response.writeHead(200);
        response.end(
          fs.readFileSync(overlayPath + request.url.replace(/%20/g, " "))
        );
        break;
    }
  });

  overlayPreviewServer.listen(8920);

  function teamHeroesContrast(gameState) {
    try {
      for (let index = 0; index < 10; index++) {
        let tryTeamName = client.outputData.player["player" + index].teamname;
      }
    } catch (error) {
      console.log(error.message);
      return;
    }
    if (
      gameState == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS" ||
      gameState == "DOTA_GAMERULES_STATE_STRATEGY_TIME" ||
      gameState == "DOTA_GAMERULES_STATE_PRE_GAME" ||
      gameState == "DOTA_GAMERULES_STATE_POST_GAME"
    ) {
      let teamHeroesBuffer = {};
      Object.keys(client.gamestate.player).forEach(function (team) {
        teamHeroesBuffer[team] = {};
        teamHeroesBuffer[team] = JSON.parse(JSON.stringify(heroDataTemplate));
        let teamHeroes = [];
        Object.keys(client.gamestate.player[team]).forEach(function (player) {
          teamHeroesBuffer[team].name =
            client.outputData.player[player].teamname;
          teamHeroes.push(client.outputData.player[player].heroname);
          heroesData.forEach(function (heroData) {
            Object.keys(heroDataTemplate).forEach(function (title) {
              if (heroData.id == client.gamestate.hero[team][player].id) {
                teamHeroesBuffer[team][title] += heroData[title];
              }
            });
          });
        });
        teamHeroesBuffer[team].heroes = teamHeroes;
      });
      teamHeroesData = teamHeroesBuffer;
    }
  }

  function controllerTeamLogo(gameState) {
    try {
      let tryTeamName = client.outputData.player["player0"].teamname;
      tryTeamName = client.outputData.player["player5"].teamname;
    } catch (error) {
      console.log(error.message);
      return;
    }
    if (
      gameState == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS" ||
      gameState == "DOTA_GAMERULES_STATE_STRATEGY_TIME" ||
      gameState == "DOTA_GAMERULES_STATE_PRE_GAME" ||
      gameState == "DOTA_GAMERULES_STATE_POST_GAME" ||
      gameState == "DOTA_GAMERULES_STATE_HERO_SELECTION"
    ) {
      document.getElementById("afterMatchTeamLogoLeft").src =
        "./overlay/teamLogoes/" +
        client.outputData.player["player0"].teamname +
        ".png";
      document.getElementById("afterMatchTeamLogoRight").src =
        "./overlay/teamLogoes/" +
        client.outputData.player["player5"].teamname +
        ".png";
    }
  }

  wsFunction["winRate_play"] = function () {
    let data = client.gamestate.map.radiant_win_chance;
    wsInGameServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = {};
        sendObj.radiantWinRate = data;
        sendObj.title = "winRate";
        sendObj.order = "play";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  wsFunction["winRate_finish"] = function () {
    wsInGameServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = {};
        sendObj.title = "winRate";
        sendObj.order = "finish";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  wsFunction["winRate_preview"] = function () {
    let data = client.gamestate.map.radiant_win_chance;
    wsPreviewServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        previewTimeOutList.forEach(function (id) {
          clearTimeout(id);
        });
        let sendObj = {};
        sendObj.title = "teamContrast";
        sendObj.order = "stop";
        client.send(JSON.stringify(sendObj));
        let previewEl = document.getElementById("previewIframe");
        previewEl.style.cssText =
          "width: 200%;height: 100%;transform: scale(0.8) translate(-43%, -12%);";
        sendObj = {};
        sendObj.radiantWinRate = data;
        sendObj.title = "winRate";
        sendObj.order = "play";
        client.send(JSON.stringify(sendObj));
      }
      let timeOutId = setTimeout(() => {
        if (client.readyState === WebSocket.OPEN) {
          let sendObj = {};
          sendObj.title = "winRate";
          sendObj.order = "finish";
          client.send(JSON.stringify(sendObj));
        }
      }, 15000);
      previewTimeOutList.push(timeOutId);
    });
  };

  wsFunction["teamContrast_play"] = function () {
    let data = teamHeroesData;
    wsInGameServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = JSON.parse(JSON.stringify(data));
        sendObj.title = "teamContrast";
        sendObj.order = "play";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  wsFunction["teamContrast_finish"] = function () {
    wsInGameServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = {};
        sendObj.title = "teamContrast";
        sendObj.order = "finish";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  wsFunction["teamContrast_preview"] = function () {
    let data = teamHeroesData;
    wsPreviewServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        previewTimeOutList.forEach(function (id) {
          clearTimeout(id);
        });
        let sendObj = {};
        sendObj.title = "winRate";
        sendObj.order = "stop";
        client.send(JSON.stringify(sendObj));
        let previewEl = document.getElementById("previewIframe");
        previewEl.style.cssText =
          "width: 300%;height: 300%;transform: scale(0.40) translate(-75%, -88%);";
        sendObj = JSON.parse(JSON.stringify(data));
        sendObj.title = "teamContrast";
        sendObj.order = "play";
        client.send(JSON.stringify(sendObj));
      }
      let timeOutId = setTimeout(() => {
        if (client.readyState === WebSocket.OPEN) {
          let sendObj = {};
          sendObj.title = "teamContrast";
          sendObj.order = "finish";
          client.send(JSON.stringify(sendObj));
        }
      }, 15000);
      previewTimeOutList.push(timeOutId);
    });
  };

  wsFunction["afterMatch_play"] = function () {
    let data = client.outputData;
    wsAfterMatchServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = JSON.parse(JSON.stringify(data));
        sendObj.score = {};
        sendObj.score.left = document.getElementById(
          "afterMatchScoreLeft"
        ).value;
        sendObj.score.right = document.getElementById(
          "afterMatchScoreRight"
        ).value;
        sendObj.order = "play";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  wsFunction["afterMatch_finish"] = function () {
    wsAfterMatchServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        let sendObj = {};
        sendObj.order = "finish";
        client.send(JSON.stringify(sendObj));
      }
    });
  };

  function getTime(YMD, DH, HMS) {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var currentDate =
      year +
      YMD +
      month +
      YMD +
      day +
      DH +
      hours +
      HMS +
      minutes +
      HMS +
      seconds;
    return currentDate;
  }

  function outputIni() {
    teamHeroesContrast(client.gamestate.map["game_state"]);
    controllerTeamLogo(client.gamestate.map["game_state"]);
    inGameOverlayList.forEach(function (title) {
      inGameBtns.forEach(function (btn) {
        document
          .getElementById(title + "-" + btn)
          .addEventListener("click", function () {
            wsFunction[title + "_" + btn]();
          });
      });
    });
    afterMatchList.forEach(function (title) {
      afterMatchBtns.forEach(function (btn) {
        document
          .getElementById(title + "-" + btn)
          .addEventListener("click", function () {
            wsFunction[title + "_" + btn]();
          });
      });
    });
    let previewEl = document.getElementById("previewIframe");
    previewEl.src = "http://127.0.0.1:8920";
    // afterMatchPlayBtn.addEventListener("click", function () {
    //   afterMatchOverlayPlay(client.outputData);
    // });

    // afterMatchFinishBtn.addEventListener("click", function () {
    //   afterMatchOverlayFinish();
    // });
  }
  // client.on('allplayers', function(data){

  client.on("map:game_state", function (gameState) {
    teamHeroesContrast(gameState);
    controllerTeamLogo(gameState);
  });
  client.on("iniFinished", function () {
    outputIni();
  });
});
