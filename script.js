// Load saved count
let count = localStorage.getItem("tasbihCount");

if (count === null) {
    count = 0;
} else {
    count = parseInt(count);
}

let target = null;
let settings = {
    stopAtTarget: false,
    theme: "dark"
};

const SETTINGS_KEY = "tasbihSettings";
const TARGET_KEY = "tasbihTarget";

// Elements
const counter = document.getElementById("counter");
const countBtn = document.getElementById("countBtn");
const minusBtn = document.getElementById("minusBtn");
const resetBtn = document.getElementById("resetBtn");
const modeBtn = document.getElementById("modeBtn");

const toastEl = document.getElementById("toast");
const targetStatusEl = document.getElementById("targetStatus");
const stopAtTargetToggle = document.getElementById("stopAtTargetToggle");

const preset33 = document.getElementById("preset33");
const preset99 = document.getElementById("preset99");
const preset100 = document.getElementById("preset100");
const preset1000 = document.getElementById("preset1000");
const clearTargetBtn = document.getElementById("clearTargetBtn");

const customTargetInput = document.getElementById("customTargetInput");
const setCustomTargetBtn = document.getElementById("setCustomTargetBtn");

const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");

let toastTimer = null;

function showToast(message) {
    if (!toastEl) {
        return;
    }

    toastEl.textContent = message;
    toastEl.classList.add("show");

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        toastEl.classList.remove("show");
    }, 1600);
}

function safeVibrate(pattern) {
    return;
}

function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            settings = {
                ...settings,
                ...parsed
            };
        } catch (e) {
        }
    }

    const savedTargetRaw = localStorage.getItem(TARGET_KEY);
    if (savedTargetRaw !== null) {
        const n = parseInt(savedTargetRaw);
        if (!Number.isNaN(n) && n > 0) {
            target = n;
        }
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function updateTargetStatus() {
    if (!targetStatusEl) {
        return;
    }

    if (!target) {
        targetStatusEl.textContent = "";
        return;
    }

    if (count === 0) {
        targetStatusEl.textContent = `Target ${target} ready`;
        return;
    }

    const remaining = Math.max(0, target - count);
    if (count >= target) {
        targetStatusEl.textContent = `Target ${target} completed`;
    } else {
        targetStatusEl.textContent = `${remaining} remaining to reach ${target}`;
    }
}

function updateCountUI() {
    counter.innerText = count;
    updateTargetStatus();

    if (progressWrap && progressBar) {
        if (!target) {
            progressWrap.style.display = "none";
            progressBar.style.width = "0%";
        } else {
            progressWrap.style.display = "block";
            const pct = Math.max(0, Math.min(100, (count / target) * 100));
            progressBar.style.width = pct.toFixed(2) + "%";
        }
    }

    const reachedTarget = !!target && count >= target;
    countBtn.disabled = reachedTarget && settings.stopAtTarget;

    updatePresetActiveState();
}

function updatePresetActiveState() {
    const presets = [
        { el: preset33, value: 33 },
        { el: preset99, value: 99 },
        { el: preset100, value: 100 },
        { el: preset1000, value: 1000 }
    ];

    presets.forEach((p) => {
        if (!p.el) {
            return;
        }

        if (target === p.value) {
            p.el.classList.add("active");
        } else {
            p.el.classList.remove("active");
        }
    });

    if (clearTargetBtn) {
        if (!target) {
            clearTargetBtn.classList.add("active");
        } else {
            clearTargetBtn.classList.remove("active");
        }
    }
}

function clearTarget() {
    target = null;
    localStorage.removeItem(TARGET_KEY);

    updateCountUI();
    showToast("Target cleared");
    safeVibrate(20);
}

function setCustomTargetFromInput() {
    if (!customTargetInput) {
        return;
    }

    const raw = String(customTargetInput.value || "").trim();
    const num = parseInt(raw, 10);

    if (!raw || Number.isNaN(num) || num < 1) {
        showToast("Enter a valid target");
        safeVibrate(20);
        return;
    }

    setTarget(num);
    customTargetInput.value = "";
    customTargetInput.blur();
}

function setTarget(num) {
    target = num;

    localStorage.setItem(TARGET_KEY, String(num));

    count = 0;

    updateCountUI();

    localStorage.setItem("tasbihCount", count);

    showToast("Target set to " + num);

    safeVibrate([30, 20, 30]);
}

// Display initial count
loadSettings();

counter.innerText = count;
updateCountUI();
updatePresetActiveState();

if (stopAtTargetToggle) {
    stopAtTargetToggle.checked = !!settings.stopAtTarget;
    stopAtTargetToggle.addEventListener("change", () => {
        settings.stopAtTarget = stopAtTargetToggle.checked;
        saveSettings();
        updateCountUI();
        showToast(settings.stopAtTarget ? "Stop at target on" : "Stop at target off");
    });
}

// ---------- INCREASE COUNT ----------
function increaseCount() {

    if (target && settings.stopAtTarget && count >= target) {
        showToast(`Target ${target} reached`);
        safeVibrate([40, 30, 40]);
        return;
    }

    count++;

    updateCountUI();

    localStorage.setItem("tasbihCount", count);

    // vibration feedback
    safeVibrate(25);

    // check target completion
    if (target && count === target) {
        showToast(`${target} completed`);

        if (countBtn) {
            countBtn.classList.add("target-reached");
            setTimeout(() => {
                countBtn.classList.remove("target-reached");
            }, 520);
        }

    }
}

countBtn.onclick = increaseCount;

// ---------- DECREASE COUNT ----------
minusBtn.onclick = function () {

    if (count > 0) {
        count--;
        updateCountUI();
        localStorage.setItem("tasbihCount", count);
    }

};

// ---------- RESET ----------
resetBtn.onclick = function () {

    count = 0;

    updateCountUI();

    localStorage.setItem("tasbihCount", count);

};

// ---------- DARK / LIGHT MODE ----------
function updateModeText() {

    if (document.body.classList.contains("dark")) {
        modeBtn.innerText = "Light Mode";
    } else {
        modeBtn.innerText = "Dark Mode";
    }

}

modeBtn.onclick = function () {

    document.body.classList.toggle("dark");

    settings.theme = document.body.classList.contains("dark") ? "dark" : "light";
    saveSettings();

    updateModeText();

};

function applyThemeFromSettings() {
    if (settings.theme === "light") {
        document.body.classList.remove("dark");
    } else {
        document.body.classList.add("dark");
    }
}

applyThemeFromSettings();
updateModeText();

if (preset33) preset33.addEventListener("click", () => setTarget(33));
if (preset99) preset99.addEventListener("click", () => setTarget(99));
if (preset100) preset100.addEventListener("click", () => setTarget(100));
if (preset1000) preset1000.addEventListener("click", () => setTarget(1000));
if (clearTargetBtn) clearTargetBtn.addEventListener("click", clearTarget);

if (setCustomTargetBtn) setCustomTargetBtn.addEventListener("click", setCustomTargetFromInput);
if (customTargetInput) {
    customTargetInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            setCustomTargetFromInput();
            e.preventDefault();
        }
    });
}

document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (active && active.tagName && active.tagName.toLowerCase() === "input") {
        return;
    }

    if (e.key === " " || e.key === "Enter") {
        increaseCount();
        e.preventDefault();
    }

    if (e.key === "Backspace" || e.key === "-") {
        minusBtn.click();
        e.preventDefault();
    }

    if (e.key.toLowerCase && e.key.toLowerCase() === "r") {
        resetBtn.click();
        e.preventDefault();
    }
});

function applyTapFeedback(e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) {
        return;
    }

    btn.classList.remove("tap-feedback");
    void btn.offsetWidth;
    btn.classList.add("tap-feedback");

    setTimeout(() => {
        btn.classList.remove("tap-feedback");
    }, 420);
}

document.addEventListener("pointerdown", applyTapFeedback);
document.addEventListener("touchstart", applyTapFeedback, { passive: true });
document.addEventListener("mousedown", applyTapFeedback);