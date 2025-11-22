// State & Configuration
const state = {
    feeds: [],
    lastFeed: null,
    settings: {
        theme: 'blue',
        darkMode: false,
        intervalHours: 2
    },
    viewMode: 'countdown' // 'countdown' or 'stopwatch'
};

// DOM Elements
const els = {
    clock: document.getElementById('live-clock'),
    mainTimer: document.getElementById('main-timer'),
    timerLabel: document.getElementById('timer-label'),
    btnStart: document.getElementById('btn-start-feed'),
    feedListPreview: document.getElementById('feed-list-preview'),
    feedListFull: document.getElementById('feed-list-full'),
    views: document.querySelectorAll('main'),
    navBtns: document.querySelectorAll('.nav-item'),
    modeBtns: document.querySelectorAll('.toggle-btn'),
    encouragement: document.getElementById('encouragement'),
    modal: document.getElementById('feed-modal'),
    form: document.getElementById('feed-form')
};

const messages = [
    "You're doing great!", "One feed at a time.", "Super parent mode: ON",
    "Breathe. You got this.", "Doing it for the little one!", "Looking good!",
    "Champion of the bottle!", "Master of the milk!"
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    requestNotificationPermission();
    setInterval(updateClock, 1000);
    setInterval(updateTimer, 1000);
    updateClock();
    updateUI();
});

// --- Core Logic ---

function loadData() {
    const savedState = localStorage.getItem('newbornTimerState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state.feeds = parsed.feeds || [];
        state.settings = { ...state.settings, ...parsed.settings };
        state.lastFeed = state.feeds.length > 0 ? state.feeds[0].start : null;
    }
    applyTheme();
}

function saveData() {
    localStorage.setItem('newbornTimerState', JSON.stringify({
        feeds: state.feeds,
        settings: state.settings
    }));
    updateUI();
}

function startFeed() {
    const now = new Date().getTime();
    const newFeed = {
        id: now,
        start: now,
        end: null,
        type: 'breast-l', // Default
        amount: null,
        brand: '',
        notes: ''
    };
    
    state.feeds.unshift(newFeed);
    state.lastFeed = now;
    
    // Rotate encouragement
    els.encouragement.textContent = messages[Math.floor(Math.random() * messages.length)];
    
    saveData();
    scheduleNotification();
}

// --- Timer Functions ---

function updateClock() {
    const now = new Date();
    els.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateTimer() {
    if (!state.lastFeed) {
        els.mainTimer.textContent = "00:00:00";
        return;
    }

    const now = new Date().getTime();
    const diff = now - state.lastFeed;
    const intervalMs = state.settings.intervalHours * 60 * 60 * 1000;

    if (state.viewMode === 'stopwatch') {
        els.mainTimer.textContent = formatDuration(diff);
        els.timerLabel.textContent = "Time since last feed";
    } else {
        // Countdown
        const remaining = intervalMs - diff;
        if (remaining < 0) {
            els.mainTimer.textContent = "-" + formatDuration(Math.abs(remaining));
            els.timerLabel.textContent = "Overdue by";
            els.mainTimer.style.color = "var(--danger)";
        } else {
            els.mainTimer.textContent = formatDuration(remaining);
            els.timerLabel.textContent = "Until next feed";
            els.mainTimer.style.color = "var(--text-main)";
        }
    }
}

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

// --- UI Updates ---

function updateUI() {
    renderFeedList(els.feedListPreview, 3);
    renderFeedList(els.feedListFull, 50);
    updateStats();
    populateBrandDataList();
}

function renderFeedList(container, limit) {
    container.innerHTML = '';
    const list = state.feeds.slice(0, limit);
    
    list.forEach(feed => {
        const date = new Date(feed.start);
        const li = document.createElement('li');
        li.className = 'feed-item';
        li.innerHTML = `
            <div class="feed-info" onclick="openEditModal(${feed.id})">
                <h4>${getTypeLabel(feed)}</h4>
                <p>${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                   ${feed.end ? '• ' + formatDuration(feed.end - feed.start) : ''}</p>
            </div>
            <button class="btn-secondary" onclick="openEditModal(${feed.id})">✎</button>
        `;
        container.appendChild(li);
    });
}

function getTypeLabel(feed) {
    if (feed.type === 'formula') return `Formula (${feed.amount || 0}oz)`;
    if (feed.type === 'bottle') return `Bottle (${feed.amount || 0}oz)`;
    return feed.type === 'breast-l' ? 'Left Breast' : 'Right Breast';
}

function updateStats() {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Feeds in last 24h
    const last24 = state.feeds.filter(f => (now - f.start) < oneDay).length;
    document.getElementById('stat-24h').textContent = last24;

    // Avg Gap
    if (state.feeds.length > 1) {
        let totalGap = 0;
        for (let i = 0; i < Math.min(state.feeds.length - 1, 10); i++) {
            totalGap += (state.feeds[i].start - state.feeds[i+1].start);
        }
        const avgMs = totalGap / Math.min(state.feeds.length - 1, 10);
        const avgHrs = (avgMs / (1000 * 60 * 60)).toFixed(1);
        document.getElementById('stat-avg').textContent = `${avgHrs}h`;
    }
}

// --- Settings & Event Listeners ---

function setupEventListeners() {
    // Navigation
    els.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.closest('button').dataset.target;
            els.views.forEach(v => {
                v.classList.remove('active-view');
                v.classList.add('hidden-view');
            });
            document.getElementById(target).classList.remove('hidden-view');
            document.getElementById(target).classList.add('active-view');
            
            els.navBtns.forEach(b => b.classList.remove('active'));
            btn.closest('button').classList.add('active');
        });
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
             document.querySelector('[data-target="view-home"]').click();
        });
    });

    // Timer Mode
    document.getElementById('btn-mode-countdown').addEventListener('click', () => setMode('countdown'));
    document.getElementById('btn-mode-stopwatch').addEventListener('click', () => setMode('stopwatch'));

    // Actions
    els.btnStart.addEventListener('click', startFeed);

    // Settings
    document.getElementById('theme-blue').addEventListener('click', () => setTheme('blue'));
    document.getElementById('theme-pink').addEventListener('click', () => setTheme('pink'));
    document.getElementById('btn-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('setting-interval').addEventListener('change', (e) => {
        state.settings.intervalHours = parseFloat(e.target.value);
        saveData();
    });
    document.getElementById('btn-clear-data').addEventListener('click', () => {
        if(confirm("Delete all history?")) {
            state.feeds = [];
            state.lastFeed = null;
            saveData();
            updateUI();
        }
    });
    document.getElementById('btn-export').addEventListener('click', exportData);

    // Modal
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('feed-type').addEventListener('change', toggleFormulaFields);
    els.form.addEventListener('submit', saveFeedEdit);
    document.getElementById('btn-delete-feed').addEventListener('click', deleteFeed);
}

function setMode(mode) {
    state.viewMode = mode;
    els.modeBtns.forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');
    updateTimer();
}

function setTheme(color) {
    state.settings.theme = color;
    applyTheme();
    saveData();
}

function applyTheme() {
    document.body.setAttribute('data-theme', state.settings.theme);
    document.body.setAttribute('data-mode', state.settings.darkMode ? 'dark' : 'light');
    
    document.getElementById('theme-blue').classList.toggle('active', state.settings.theme === 'blue');
    document.getElementById('theme-pink').classList.toggle('active', state.settings.theme === 'pink');
    document.getElementById('setting-interval').value = state.settings.intervalHours;
}

function toggleDarkMode() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveData();
}

// --- Modal & Forms ---

let editingId = null;

window.openEditModal = function(id) {
    editingId = id;
    const feed = state.feeds.find(f => f.id === id);
    if (!feed) return;

    document.getElementById('feed-id').value = feed.id;
    document.getElementById('feed-start').value = new Date(feed.start - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    document.getElementById('feed-end').value = feed.end ? new Date(feed.end - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
    document.getElementById('feed-type').value = feed.type;
    document.getElementById('feed-amount').value = feed.amount || '';
    document.getElementById('feed-brand').value = feed.brand || '';
    document.getElementById('feed-notes').value = feed.notes || '';

    toggleFormulaFields();
    els.modal.classList.add('open');
};

function closeModal() {
    els.modal.classList.remove('open');
    editingId = null;
}

function toggleFormulaFields() {
    const type = document.getElementById('feed-type').value;
    const show = (type === 'formula' || type === 'bottle');
    document.getElementById('formula-details').classList.toggle('hidden', !show);
}

function populateBrandDataList() {
    const brands = [...new Set(state.feeds.filter(f => f.brand).map(f => f.brand))];
    const dataList = document.getElementById('brand-list');
    dataList.innerHTML = brands.map(b => `<option value="${b}">`).join('');
}

function saveFeedEdit(e) {
    e.preventDefault();
    if (!editingId) return;

    const feedIndex = state.feeds.findIndex(f => f.id === editingId);
    if (feedIndex === -1) return;

    const formData = {
        start: new Date(document.getElementById('feed-start').value).getTime(),
        end: document.getElementById('feed-end').value ? new Date(document.getElementById('feed-end').value).getTime() : null,
        type: document.getElementById('feed-type').value,
        amount: document.getElementById('feed-amount').value,
        brand: document.getElementById('feed-brand').value,
        notes: document.getElementById('feed-notes').value
    };

    state.feeds[feedIndex] = { ...state.feeds[feedIndex], ...formData };
    
    // If we edited the most recent feed, update the global timer
    if (feedIndex === 0) state.lastFeed = formData.start;

    // Re-sort feeds in case date changed
    state.feeds.sort((a, b) => b.start - a.start);
    
    saveData();
    closeModal();
}

function deleteFeed() {
    if (!editingId || !confirm("Delete this entry?")) return;
    state.feeds = state.feeds.filter(f => f.id !== editingId);
    if (state.feeds.length > 0) state.lastFeed = state.feeds[0].start;
    else state.lastFeed = null;
    
    saveData();
    closeModal();
}

// --- Notifications & Export ---

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function scheduleNotification() {
    if (Notification.permission === "granted") {
        const intervalMs = state.settings.intervalHours * 60 * 60 * 1000;
        // Note: This simple timeout only works if app is open/backgrounded on Desktop/Android.
        // iOS puts aggressive limits on background timers.
        // A robust PWA solution for iOS usually requires Push API (Server-side).
        // We implement best-effort local notification here.
        setTimeout(() => {
            new Notification("Feeding Time!", {
                body: "It's been " + state.settings.intervalHours + " hours since the last feed.",
                icon: "icons/icon-192.png"
            });
        }, intervalMs);
    }
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.feeds, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "feeding_log.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
