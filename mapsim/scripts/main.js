import { bossPos, defAvatarSize, defPos } from "./bossPos.js";
const settings = {
  async: true,
  crossDomain: true,
  url: "/timeLine",
  method: "GET",
};
$(".guild").css("opacity", 0);
$(".guild").css(
  "transform",
  "translate(" +
    (defPos[0] - defAvatarSize / 2) +
    "px," +
    (defPos[1] - defAvatarSize / 2) +
    "px)"
);

for (let index = 0; index < bossPos.length; index++) {
  $(".boss" + index).css(
    "transform",
    "translate(" +
      (bossPos[index][0] - defAvatarSize / 2) +
      "px," +
      (bossPos[index][1] - defAvatarSize / 2) +
      "px)"
  );
}

let timeLineCallBack = (guilds) => {
  if (Object.keys(guilds).length < 4) {
    for (let elIndex = Object.keys(guilds).length; elIndex < 4; elIndex++) {
      $("#guildMap" + elIndex)
        .children("line")
        .attr("x1", null);
      $("#guildMap" + elIndex)
        .children("line")
        .attr("x2", null);
      $("#guildMap" + elIndex)
        .children("line")
        .attr("y1", null);
      $("#guildMap" + elIndex)
        .children("line")
        .attr("y2", null);
      $(".guild" + elIndex).css("opacity", 0);
      $(".guild" + elIndex).css(
        "transform",
        "translate(" +
          (defPos[0] - defAvatarSize / 2) +
          "px," +
          (defPos[1] - defAvatarSize / 2) +
          "px)"
      );
      $("#guild" + elIndex)
        .children("line")
        .removeClass("line-cur");
    }
  }
  let guildsSort = [];
  for (
    let guildIndex = 0;
    guildIndex < Object.keys(guilds).length;
    guildIndex++
  ) {
    let guild = Object.keys(guilds)[guildIndex];
    guildsSort[guilds[guild].guildId] = guild;
  }
  for (let guildIndex = 0; guildIndex < guildsSort.length; guildIndex++) {
    let guild = guildsSort[guildIndex];
    let timeLine = guilds[guild].timeLine;
    let finishedBoss = [];
    timeLine.forEach((boss, index) => {
      if (boss.finished) {
        boss.bossId = index;
        finishedBoss.push(boss);
      }
    });
    finishedBoss.sort((a, b) => {
      return a.finishedTimeStamp - b.finishedTimeStamp;
    });

    if (finishedBoss.length > 0) {
      $(".guild" + guildIndex).attr(
        "xlink:href",
        "./teamLogoes/" + guild + ".png"
      );
      $(".guild" + guildIndex).css("opacity", 1);
      let posCurX = bossPos[finishedBoss[finishedBoss.length - 1].bossId][0];
      let posCurY = bossPos[finishedBoss[finishedBoss.length - 1].bossId][1];
      let posX = posCurX - defAvatarSize / 2;
      let posY = posCurY - defAvatarSize / 2;
      let posPreX;
      let posPreY;
      if (finishedBoss.length == 1) {
        posPreX = defPos[0];
        posPreY = defPos[1];
      } else {
        posPreX = bossPos[finishedBoss[finishedBoss.length - 2].bossId][0];
        posPreY = bossPos[finishedBoss[finishedBoss.length - 2].bossId][1];
      }
      let lineLength = Math.sqrt(
        (posPreY - posCurY) ** 2 + (posPreX - posCurX) ** 2
      );
      let lineEl = $("#guildMap" + guildIndex).children(
        ".line" + finishedBoss.length
      );
      lineEl.attr("x1", posPreX);
      lineEl.attr("y1", posPreY);
      lineEl.attr("x2", posCurX);
      lineEl.attr("y2", posCurY);
      lineEl.css("stroke-dasharray", lineLength + "px");
      lineEl.css("stroke-dashoffset", lineLength + "px");
      lineEl.addClass("line-cur");
      $(".guild" + guildIndex).css(
        "transform",
        "translate(" + posX + "px," + posY + "px)"
      );
      for (let lineindex = 1; lineindex < finishedBoss.length; lineindex++) {
        let preLineEl = $("#guildMap" + guildIndex).children(
          ".line" + lineindex
        );
        let dashPosCurX = bossPos[finishedBoss[lineindex - 1].bossId][0];
        let dashPosCurY = bossPos[finishedBoss[lineindex - 1].bossId][1];
        let dashposPreX = defPos[0];
        let dashposPreY = defPos[1];
        if (lineindex > 1) {
          dashposPreX = bossPos[finishedBoss[lineindex - 2].bossId][0];
          dashposPreY = bossPos[finishedBoss[lineindex - 2].bossId][1];
        }
        preLineEl.attr("x1", dashposPreX);
        preLineEl.attr("y1", dashposPreY);
        preLineEl.attr("x2", dashPosCurX);
        preLineEl.attr("y2", dashPosCurY);
        preLineEl.css("stroke-dasharray", "15px");
        preLineEl.css("stroke-dashoffset", "0");
      }
    } else {
      $("#guild" + guildIndex)
        .children("line")
        .attr("x1", null);
      $("#guild" + guildIndex)
        .children("line")
        .attr("x2", null);
      $("#guild" + guildIndex)
        .children("line")
        .attr("y1", null);
      $("#guild" + guildIndex)
        .children("line")
        .attr("y2", null);
      $("#guild" + guildIndex)
        .children("line")
        .removeClass("line-cur");
      $(".guild" + guildIndex).css("opacity", 0);
      $(".guild" + guildIndex).css(
        "transform",
        "translate(" +
          (defPos[0] - defAvatarSize / 2) +
          "px," +
          (defPos[1] - defAvatarSize / 2) +
          "px)"
      );
    }
  }
  //   Object.keys(guilds).forEach((guild, guildIndex) => {

  //   });
};

setInterval(() => {
  $.ajax(settings).done(function (response) {
    // console.log(response);
    timeLineCallBack(response);
  });
}, 1000);
