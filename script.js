let count = localStorage.getItem("tasbihCount");

if (count === null) {
    count = 0;
}

document.getElementById("counter").innerText = count;

document.getElementById("countBtn").onclick = function () {

    count++;

    document.getElementById("counter").innerText = count;

    localStorage.setItem("tasbihCount", count);

};

document.getElementById("resetBtn").onclick = function () {

    count = 0;

    document.getElementById("counter").innerText = count;

    localStorage.setItem("tasbihCount", count);

};

document.getElementById("modeBtn").onclick = function () {

    document.body.classList.toggle("dark");

};