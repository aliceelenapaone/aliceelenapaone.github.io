const STORAGE_KEY = "coffee-counter-state";
const DAILY_LIMIT = 5;
const COFFEE_PRICE = 1;

const elements = {
    today: document.querySelector("#today-label"),
    yearLabel: document.querySelector("#year-label"),
    statsYear: document.querySelector("#stats-year"),
    consumed: document.querySelector("#coffee-count"),
    offered: document.querySelector("#offered-count"),
    yearlyConsumed: document.querySelector("#year-consumed"),
    yearlyOffered: document.querySelector("#yearly-offered"),
    cost: document.querySelector("#coffee-cost"),
    addConsumed: document.querySelector("#add-coffee"),
    removeConsumed: document.querySelector("#remove-coffee"),
    addOffered: document.querySelector("#add-offered"),
    removeOffered: document.querySelector("#remove-offered"),
    limitMessage: document.querySelector("#limit-message"),
    status: document.querySelector("#status-message")
};

let state = {
    date: getLocalDateKey(),
    year: new Date().getFullYear(),
    consumedToday: 0,
    offeredToday: 0,
    consumedYear: 0,
    offeredYear: 0
};
let storageReady = true;
let midnightTimer;

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function showStorageError(message) {
    storageReady = false;
    elements.status.textContent = message;
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch {
        showStorageError("Impossibile salvare i dati: abilita la memoria locale del browser.");
        return false;
    }
}

function isValidCount(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

function isValidSavedState(savedState) {
    return savedState !== null
        && typeof savedState === "object"
        && typeof savedState.date === "string"
        && /^\d{4}-\d{2}-\d{2}$/.test(savedState.date)
        && Number.isInteger(savedState.year)
        && isValidCount(savedState.consumedToday)
        && savedState.consumedToday <= DAILY_LIMIT
        && isValidCount(savedState.offeredToday)
        && isValidCount(savedState.consumedYear)
        && isValidCount(savedState.offeredYear);
}

function loadState() {
    let savedValue;
    try {
        savedValue = localStorage.getItem(STORAGE_KEY);
    } catch {
        showStorageError("Impossibile accedere alla memoria locale del browser.");
        return;
    }

    if (savedValue === null) {
        return;
    }

    let savedState;
    try {
        savedState = JSON.parse(savedValue);
    } catch {
        showStorageError("I dati salvati non sono leggibili. Cancella i dati del sito per ricominciare.");
        return;
    }

    if (savedState && typeof savedState === "object" && Number.isInteger(savedState.count)) {
        const today = getLocalDateKey();
        const year = new Date().getFullYear();
        const legacyCount = savedState.date === today
            && savedState.count >= 0
            && savedState.count <= DAILY_LIMIT
            ? savedState.count
            : 0;

        state = {
            date: today,
            year,
            consumedToday: legacyCount,
            offeredToday: 0,
            consumedYear: legacyCount,
            offeredYear: 0
        };
        saveState();
        return;
    }

    if (!isValidSavedState(savedState)) {
        showStorageError("I dati salvati non sono validi. Cancella i dati del sito per ricominciare.");
        return;
    }

    state = savedState;
    reconcileDate();
}

function render() {
    const now = new Date();
    elements.today.textContent = new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(now);
    elements.yearLabel.textContent = String(state.year);
    elements.statsYear.textContent = String(state.year);
    elements.consumed.textContent = String(state.consumedToday);
    elements.offered.textContent = String(state.offeredToday);
    elements.yearlyConsumed.textContent = String(state.consumedYear);
    elements.yearlyOffered.textContent = String(state.offeredYear);
    elements.cost.textContent = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR"
    }).format((state.consumedToday + state.offeredToday) * COFFEE_PRICE);

    elements.addConsumed.disabled = !storageReady || state.consumedToday >= DAILY_LIMIT;
    elements.removeConsumed.disabled = !storageReady || state.consumedToday === 0;
    elements.addOffered.disabled = !storageReady;
    elements.removeOffered.disabled = !storageReady || state.offeredToday === 0;
    elements.limitMessage.textContent = state.consumedToday >= DAILY_LIMIT
        ? "Hai raggiunto il limite di 5 caffè bevuti per oggi."
        : "";
}

function reconcileDate() {
    const now = new Date();
    const today = getLocalDateKey(now);
    const year = now.getFullYear();
    let changed = false;

    if (state.year !== year) {
        state.year = year;
        state.consumedYear = 0;
        state.offeredYear = 0;
        changed = true;
    }

    if (state.date !== today) {
        state.date = today;
        state.consumedToday = 0;
        state.offeredToday = 0;
        changed = true;
    }

    if (changed) {
        elements.status.textContent = "";
        saveState();
        render();
    }

    scheduleMidnightReset();
}

function scheduleMidnightReset() {
    window.clearTimeout(midnightTimer);
    const now = new Date();
    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );
    midnightTimer = window.setTimeout(
        reconcileDate,
        nextMidnight.getTime() - now.getTime() + 50
    );
}

function updateCounter(kind, change) {
    if (!storageReady) {
        return;
    }

    const todayKey = kind === "consumed" ? "consumedToday" : "offeredToday";
    const yearKey = kind === "consumed" ? "consumedYear" : "offeredYear";
    const todayCount = state[todayKey];
    const yearCount = state[yearKey];

    if (change < 0 && todayCount === 0) {
        return;
    }
    if (change > 0 && kind === "consumed" && todayCount >= DAILY_LIMIT) {
        return;
    }
    if (change > 0 && (!Number.isSafeInteger(todayCount + 1) || !Number.isSafeInteger(yearCount + 1))) {
        elements.status.textContent = "Il contatore ha raggiunto il limite numerico supportato dal browser.";
        return;
    }

    state[todayKey] += change;
    state[yearKey] += change;
    if (!saveState()) {
        state[todayKey] -= change;
        state[yearKey] -= change;
    }
    render();
}

elements.addConsumed.addEventListener("click", () => updateCounter("consumed", 1));
elements.removeConsumed.addEventListener("click", () => updateCounter("consumed", -1));
elements.addOffered.addEventListener("click", () => updateCounter("offered", 1));
elements.removeOffered.addEventListener("click", () => updateCounter("offered", -1));

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        reconcileDate();
    }
});

loadState();
render();
scheduleMidnightReset();
