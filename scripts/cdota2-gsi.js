var express = require("express");
var bodyParser = require("body-parser");
var eventEmitter = require("events").EventEmitter;
var path = require("path");
var fs = require("fs");

var events = new eventEmitter();
var clients = [];
var outputData = {};
var playersPath = path.join(__dirname, "../players.json");
playersData = JSON.parse(fs.readFileSync(playersPath, "utf-8"));
outputData.map = {};
outputData.player = {};
var outputIni = false;
function gsi_client(ip, auth) {
  this.ip = ip;
  this.auth = auth;
  this.gamestate = {};
  this.outputData = {};
}
gsi_client.prototype.__proto__ = eventEmitter.prototype;

function Check_client(req, res, next) {
  // Check if this IP is already talking to us
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].ip == req.ip) {
      req.client = clients[i];
      return next();
    }
  }

  // Create a new client
  clients.push(new gsi_client(req.ip, req.body.auth));
  req.client = clients[clients.length - 1];
  req.client.gamestate = req.body;

  // Notify about the new client
  events.emit("newclient", clients[clients.length - 1]);

  next();
}

function Emit_all(prefix, obj, emitter) {
  Object.keys(obj).forEach(function (key) {
    // For scanning keys and testing
    // emitter.emit("key", ""+prefix+key);
    // console.log("Emitting '"+prefix+key+"' - " + obj[key]);
    emitter.emit(prefix + key, obj[key]);
  });
}

function Recursive_emit(prefix, changed, body, emitter) {
  Object.keys(changed).forEach(function (key) {
    if (typeof changed[key] == "object") {
      if (body[key] != null) {
        // safety check
        Recursive_emit(prefix + key + ":", changed[key], body[key], emitter);
      }
    } else {
      // Got a key
      if (body[key] != null) {
        if (typeof body[key] == "object") {
          // Edge case on added:item/ability:x where added shows true at the top level
          // and doesn't contain each of the child keys
          Emit_all(prefix + key + ":", body[key], emitter);
        } else {
          // For scanning keys and testing
          // emitter.emit("key", ""+prefix+key);
          // console.log("Emitting '"+prefix+key+"' - " + body[key]);
          emitter.emit(prefix + key, body[key]);
        }
      }
    }
  });
}

function Process_changes(section) {
  return function (req, res, next) {
    if (req.body[section]) {
      // console.log("Starting recursive emit for '" + section + "'");
      Recursive_emit("", req.body[section], req.body, req.client);
    }
    next();
  };
}

function Update_gamestate(req, res, next) {
  if (req.body.map != undefined) {
    if (
      req.body.map["game_state"] != "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS" &&
      req.body.map["game_state"] != "DOTA_GAMERULES_STATE_STRATEGY_TIME" &&
      req.body.map["game_state"] != "DOTA_GAMERULES_STATE_PRE_GAME" &&
      req.body.map["game_state"] != "DOTA_GAMERULES_STATE_HERO_SELECTION" &&
      req.body.map["game_state"] != "DOTA_GAMERULES_STATE_POST_GAME"
    ) {
      return;
    }
  } else {
    return;
  }

  Object.keys(req.body.player).forEach(function (team) {
    let teamKillsBuffer = 0;
    try {
      let tryBuffer = {};
      tryBuffer.player = {};
      Object.keys(req.body.player[team]).forEach(function (player) {
        tryBuffer.player[player] = {};
        tryBuffer.player[player].officialname =
          playersData[req.body.player[team][player].steamid].name;
        tryBuffer.player[player].teamname =
          playersData[req.body.player[team][player].steamid].team;
        tryBuffer.player[player].pos =
          playersData[req.body.player[team][player].steamid].position;
      });
    } catch (error) {
      console.log(error.message);
      return;
    }
    req.client.gamestate = req.body;
    outputData.map = req.body.map;
    Object.keys(req.body.player[team]).forEach(function (player) {
      outputData.player[player] = {};
      outputData.player[player].steamid = req.body.player[team][player].steamid;
      outputData.player[player].name = req.body.player[team][player].name;
      outputData.player[player].heroname = req.body.hero[team][player].name;
      outputData.player[player].level = req.body.hero[team][player].level;
      outputData.player[player].kill = req.body.player[team][player].kills;
      outputData.player[player].death = req.body.player[team][player].deaths;
      outputData.player[player].assist = req.body.player[team][player].assists;
      outputData.player[player].networth =
        req.body.player[team][player]["net_worth"];
      outputData.player[player].herodamage =
        req.body.player[team][player]["hero_damage"];
      outputData.player[player].gpm = req.body.player[team][player].gpm;
      outputData.player[player].xpm = req.body.player[team][player].xpm;
      outputData.player[player]["last_hits"] =
        req.body.player[team][player]["last_hits"];
      outputData.player[player].denies = req.body.player[team][player].denies;
      for (let i = 0; i < 9; i++) {
        if (req.body.items[team][player]["slot" + i] != undefined) {
          outputData.player[player]["slot" + i] =
            req.body.items[team][player]["slot" + i].name;
        }
      }
      outputData.player[player]["wards_purchased"] =
        req.body.player[team][player]["wards_purchased"];
      outputData.player[player]["wards_placed"] =
        req.body.player[team][player]["wards_placed"];
      outputData.player[player]["wards_destroyed"] =
        req.body.player[team][player]["wards_destroyed"];
      outputData.player[player]["runes_activated"] =
        req.body.player[team][player]["runes_activated"];
      outputData.player[player]["support_gold_spent"] =
        req.body.player[team][player]["support_gold_spent"];
      outputData.player[player]["consumable_gold_spent"] =
        req.body.player[team][player]["consumable_gold_spent"];
      outputData.player[player]["item_gold_spent"] =
        req.body.player[team][player]["item_gold_spent"];
      outputData.player[player]["gold_lost_to_death"] =
        req.body.player[team][player]["gold_lost_to_death"];
      outputData.player[player]["gold_from_hero_kills"] =
        req.body.player[team][player]["gold_from_hero_kills"];
      outputData.player[player]["gold_from_creep_kills"] =
        req.body.player[team][player]["gold_from_creep_kills"];
      outputData.player[player]["gold_from_income"] =
        req.body.player[team][player]["gold_from_income"];
      outputData.player[player]["gold_from_shared"] =
        req.body.player[team][player]["gold_from_shared"];
      outputData.player[player]["camps_stacked"] =
        req.body.player[team][player]["camps_stacked"];
      teamKillsBuffer += req.body.player[team][player].kills;
      outputData.player[player].officialname =
        playersData[req.body.player[team][player].steamid].name;
      outputData.player[player].teamname =
        playersData[req.body.player[team][player].steamid].team;
      outputData.player[player].pos =
        playersData[req.body.player[team][player].steamid].position;
    });
    Object.keys(req.body.player[team]).forEach(function (player) {
      outputData.player[player]["fightrate"] =
        ((req.body.player[team][player].kills +
          req.body.player[team][player].assists) *
          100) /
        teamKillsBuffer;
      outputData.player[player]["fightrate"] =
        outputData.player[player]["fightrate"].toFixed(1) + "%";
    });
  });
  req.client.outputData = outputData;
  if (!outputIni) {
    outputIni = true;
    req.client.emit("iniFinished", 1);
  }
  next();
}

function New_data(req, res) {
  req.client.emit("newdata", req.body);
  res.end();
}

function Check_auth(tokens) {
  return function (req, res, next) {
    if (tokens) {
      if (
        req.body.auth && // Body has auth
        (req.body.auth.token == tokens || // tokens was a single string or
          (tokens.constructor === Array && // tokens was an array and
            tokens.indexOf(req.body.auth.token) != -1))
      ) {
        // containing the token
        next();
      } else {
        // Not a valid auth, drop the message
        console.log(
          "Dropping message from IP: " + req.ip + ", no valid auth token"
        );
        res.end();
      }
    } else {
      next();
    }
  };
}

var d2gsi = function (options) {
  options = options || {};
  var port = options.port || 3000;
  var tokens = options.tokens || null;
  var ip = options.ip || "0.0.0.0";

  var app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post(
    "/",
    Check_auth(tokens),
    Check_client,
    Update_gamestate,
    Process_changes("previously"),
    Process_changes("added"),
    New_data
  );

  var server = app.listen(port, ip, function () {
    console.log("Dota 2 GSI listening on port " + server.address().port);
  });

  this.events = events;
  return this;
};

module.exports = d2gsi;
