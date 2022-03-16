// let ipcR = require("electron").ipcRenderer;
let closeBtn = document.getElementById("closeBtn");
let minBtn = document.getElementById("minBtn");
let maxBtn = document.getElementById("maxBtn");
let drag = require("electron-drag");

// function addLis(el, ev) {
//   el.addEventListener("click", function () {
//     ipcR.send(ev);
//   });
// }

// addLis(closeBtn, "close");
// addLis(minBtn, "min");
// addLis(maxBtn, "max");
drag("#topContainer");
