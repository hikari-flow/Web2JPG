"use strict";

exports.progressBar = {
    init: function () {
        const progressBar = document.getElementById("progress-bar");
        progressBar.classList.remove("progress-bar-complete");
        progressBar.classList.add("progress-bar-animated");
        progressBar.style.width = "0%";
        progressBar.textContent = "0%";
        document.getElementById("progress").style.width = "100%";
    },
    update: function (completed, total) {
        const progressBar = document.getElementById("progress-bar");
        const percentFinished = `${Math.round((completed / total) * 100)}%`;
        progressBar.textContent = percentFinished;
        progressBar.style.width = percentFinished;
    },
    complete: function () {
        const progressBar = document.getElementById("progress-bar");
        progressBar.classList.remove("progress-bar-animated");
        progressBar.classList.add("progress-bar-complete");
        progressBar.textContent = "Done";
    }
}

exports.outputText = {
    init: function () {
        const outputText = document.getElementById("output-text");
        outputText.textContent = "Initializing... Please wait.";
    },
    add: function (message) {
        const outputText = document.getElementById("output-text");
        outputText.innerHTML += message;
    }
}

exports.overlay = function (message) {
    document.getElementById("overlay-text").textContent = message;
    document.getElementById("overlay").style.display = "block";
}
