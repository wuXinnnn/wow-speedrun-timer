let saveButton = document.getElementById("saveButton");
let uploadButton = document.getElementById("uploadButton");
// let generateButton = document.getElementById("generateButton");
let notModal = document.getElementById("bodyContainer");
let warningModal = document.getElementById("warningModalBox");
let allStopButtons = document.getElementsByClassName(
  "guild-boss-time-stop-container"
);
let warningModalShowed = false;
// let contentContainer = document.getElementById("contentContainer");
// let guildBossesFrames = document.getElementsByClassName(
//   "guild-bosses-container"
// );

// let ipcRenderer = require('electron').ipcRenderer;

function GuildFrameIni() {
  stopers.forEach((BossStopers) => {
    BossStopers.forEach((stoper) => {
      stoper.removeEventListener("change", timerStopCallback);
    });
  });
  stopers = [];
  contentContainer.innerHTML = "";
  guildBossListCreator(0);
  // loadPreset("loadLast", path.join(__dirname, "./last.json"));
}

function guildBossListCreator(guildIndex) {
  let guildContent = document.createElement("div");
  let guildLabel = document.createElement("label");
  let guildTitleContainer = document.createElement("div");
  let guildNameSpan = document.createElement("span");
  let guildNameInput = document.createElement("input");
  let guildSlotSpan = document.createElement("span");
  let guildClearDiv = document.createElement("div");
  guildContent.className =
    "content nes-container is-rounded is-dark guild" + guildIndex;
  guildLabel.setAttribute("for", "guild" + guildIndex);
  guildLabel.style.color = "#fff";
  guildTitleContainer.className = "guild-container nes-field is-inline is-dark";
  guildNameSpan.className = "guild-name-title";
  guildNameSpan.textContent = "GUILD NAME:";
  guildNameInput.className = "nes-input is-dark";
  guildNameInput.type = "text";
  guildSlotSpan.className = "frameSlot";
  guildSlotSpan.textContent = parseInt(guildIndex) + 1 + "#";
  guildClearDiv.className = "clear";
  guildTitleContainer.appendChild(guildNameSpan);
  guildTitleContainer.appendChild(guildNameInput);
  guildContent.appendChild(guildLabel);
  guildContent.appendChild(guildTitleContainer);
  guildContent.appendChild(guildSlotSpan);
  guildContent.appendChild(guildClearDiv);
  let guildFrame = document.createElement("div");
  guildFrame.innerHTML = "";
  guildFrame.className = "guild-bosses-container";
  let bossTimerStoper = [];
  global.bossList.forEach((boss, bossIndex) => {
    let guildBoss = document.createElement("div");
    let bossTitle = document.createElement("p");
    let guildBossTimerView = document.createElement("div");
    let bossTimerStopContainer = document.createElement("div");
    let bossTimerStopButton = document.createElement("button");
    guildBoss.className =
      "guild-boss nes-container is-dark with-title is-centered";
    bossTitle.className = "title boss-title";
    bossTitle.textContent = boss.bossName;
    guildBossTimerView.className = "guild-boss-timer-view";
    guildBossTimerView.setAttribute("bossId", bossIndex);
    bossTimerStopContainer.className = "guild-boss-time-stop-container";
    bossTimerStopButton.className = "nes-btn is-error guild-boss-time-stop";
    bossTimerStopButton.textContent = "STOP!";
    bossTimerStopContainer.appendChild(bossTimerStopButton);
    guildBoss.appendChild(bossTitle);
    guildBoss.appendChild(guildBossTimerView);
    guildBoss.appendChild(bossTimerStopContainer);
    guildFrame.appendChild(guildBoss);
    bossTimerStopButton.addEventListener("click", timerStopCallback);
    bossTimerStoper.push(bossTimerStopButton);
  });
  stopers.push(bossTimerStoper);
  guildContent.appendChild(guildFrame);
  contentContainer.appendChild(guildContent);
}

function timerStopCallback(event) {
  let guildBossView = event.target.parentNode.previousSibling;
  gEvent.emit("stopClick", guildBossView);
}

function allStopShow() {
  for (let index = 0; index < allStopButtons.length; index++) {
    allStopButtons[index].style.transform = "translateY(0px)";
  }
}

function allStopHide() {
  for (let index = 0; index < allStopButtons.length; index++) {
    allStopButtons[index].style.transform = "translateY(60px)";
  }
}

function itemDeleteCallback(event) {
  event.target.parentNode.remove();
}

function warningModalHide() {
  let preCss = document.createElement("div");
  preCss.style.right = warningModal.style.right;
  preCss.style.setProperty("opacity", "1");
  preCss.style.setProperty("transform", "scale(0) rotate(-15deg)");
  preCss.style.setProperty(
    "transition",
    "transform .25s cubic-bezier(0.33, -0.38, 0.59, -0.43)"
  );
  warningModal.style.cssText = preCss.style.cssText;
}

function warningModalShow(i) {
  let preCss = document.createElement("div");
  preCss.style.right =
    document.documentElement.clientWidth -
    TotalReadyButton.getBoundingClientRect().left -
    44;
  preCss.style.setProperty("opacity", "1");
  preCss.style.setProperty("transform", "scale(1) rotate(0deg)");
  preCss.style.setProperty(
    "transition",
    "transform .25s cubic-bezier(0.43, 1.35, 0.7, 1.39)"
  );
  let warningEl = document.createElement("div");
  warningEl.innerHTML = "Haven't Set Guild Name For " + i.length + " Frame";
  if (i.length == 1) {
    warningEl.innerHTML += ": ";
  } else {
    warningEl.innerHTML += "s: ";
  }
  i.forEach(function (num) {
    let numEl = document.createElement("span");
    numEl.innerHTML = "   " + (num + 1) + "#";
    warningEl.appendChild(numEl);
  });
  warningModal.innerHTML = warningEl.innerHTML;
  warningModal.setAttribute("class", "xModal nes-balloon from-right is-dark");
  warningModal.style.cssText = preCss.style.cssText;
  warningModalShowed = true;
}
addButton.addEventListener("click", () => {
  let guildCount = guildBossesFrames.length;
  guildBossListCreator(guildCount);
});
reduceButton.addEventListener("click", () => {
  let guildCount = guildBossesFrames.length;
  let guildContent = document.getElementsByClassName("content")[guildCount - 1];
  guildContent.remove();
  stopers[guildCount - 1].forEach((stoper) => {
    stoper.removeEventListener("change", timerStopCallback);
  });
});

function errorModalShow(e) {
  let errorBtn = document.getElementById(e[1] + "Button");
  let preCss = document.createElement("div");
  preCss.style.right =
    document.documentElement.clientWidth -
    errorBtn.getBoundingClientRect().left -
    44;
  preCss.style.setProperty("opacity", "1");
  preCss.style.setProperty("transform", "scale(1) rotate(0deg)");
  preCss.style.setProperty(
    "transition",
    "transform .25s cubic-bezier(0.43, 1.35, 0.7, 1.39)"
  );
  let warningEl = document.createElement("div");
  warningEl.innerHTML = e[0];
  warningModal.innerHTML = warningEl.innerHTML;
  warningModal.setAttribute("class", "xModal nes-balloon from-right is-dark");
  warningModal.style.cssText = preCss.style.cssText;
}

document.addEventListener("click", function (el) {
  let modalBox = document.getElementById("warningModalBox");
  if (modalBox.contains(el.target)) {
    return;
  }
  // if (!warningModalShowed) {
  //   return;
  // }
  warningModalHide();
});

notModal.addEventListener("dragover", (e) => {
  e.stopPropagation();
  e.preventDefault();
});

notModal.addEventListener("drop", (e) => {
  e.stopPropagation();
  e.preventDefault();
  loadPreset("drag", e.dataTransfer.files[0].path);
});

gEvent.on("safeCheckFailed", (safeCheckArray) => {
  setTimeout(() => {
    warningModalShow(safeCheckArray);
  }, 20);
});
saveButton.addEventListener("click", () => {
  ipcRenderer.send("saveGlobalNormal");
});
uploadButton.addEventListener("click", () => {
  ipcRenderer.send("loadPreset");
});
// generateButton.addEventListener("click", () => {
//   gEvent.emit("globalUpdate");
// });
TotalStartButton.addEventListener("click", () => {
  gEvent.emit("TotalStart");
});
TotalStopButton.addEventListener("click", () => {
  gEvent.emit("TotalStop");
});
TotalResetButton.addEventListener("click", () => {
  gEvent.emit("TotalReset");
});
TotalReadyButton.addEventListener("click", () => {
  gEvent.emit("TotalReady");
});

gEvent.on("started", allStopShow);
gEvent.on("allStopHide", allStopHide);
gEvent.on("allStopShow", allStopShow);
gEvent.on("errorModalShow", errorModalShow);

GuildFrameIni();
loadPreset("loadLast", path.join(__dirname, "./last.json"));
