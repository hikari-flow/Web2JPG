"use strict";

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");

exports.display = (message) => {
    overlayText.appendChild(document.createTextNode(message));
    overlay.style.display = "block";
}

exports.clear = () => document.getElementById("overlay-text").innerHTML = '';
