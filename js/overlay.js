"use strict";

exports.display = function (message) {
    document.getElementById("overlay-text").textContent = message;
    document.getElementById("overlay").style.display = 'block';
}
