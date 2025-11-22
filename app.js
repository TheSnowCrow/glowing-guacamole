/**

- Nurture PWA Logic
- Stores data in localStorage under ‘nurture_data’
  */

// — State Management —
let state = {
feeds: [],
settings: {
intervalMinutes: 150, // 2.5 hours
theme: ‘dark’
},
viewMode: ‘countdown’ // ‘countdown’ or ‘stopwatch’
};

// — DOM Elements —
const els = {
clock: document.getElementById(‘live-clock’),
mainDisplay: document.getElementById(‘main-display’),
subDisplay: document.getElementById(‘sub-display’),
encouragement: document.getElementById(‘encouragement’),
feedListPreview: document.getElementById(‘feed-list-preview’),
feedListFull: document.getElementById(‘feed-list-full’),
toggleCountdown: document.getElementById(‘toggle-countdown’),
toggleStopwatch: document.getElementById(‘toggle-stopwatch’),
startBtn: document.getElementById(‘btn-start-feed’),
btnSettings: document.getElementById(‘btn-settings’),
btnStats: document.getElementById(‘btn-view-stats’),
views: {
home: document.getElementById(‘view-home’),
stats: document.getElementById(‘view-stats’),
settings: document.getElementById(‘view-settings’)
},
inputs: {
theme: document.getElementById(‘setting-theme’),
interval: document.getElementById(‘setting-interval’)
},
modal: {
overlay: document.getElementById(‘modal-edit’),
time: document.getElementById(‘edit-time’),
typeGroup: document.getElementById(‘edit-type-group’),
typeInput: document.getElementById(‘edit-type’),
amount: document.getElementById(‘edit-amount’),
notes: document.getElementById(‘edit-notes’),
id: document.getElementById(‘edit-id’),
saveBtn: document.getElementById(‘btn-save-entry’),
delBtn: document.getElementById(‘btn-delete-entry’)
}
};

const messages = [
“You’re doing great!”, “One feed at a time.”, “You got this!”,
“Deep breaths.”, “Remember to hydrate.”, “Super parent mode: ON”,
“Doing an amazing job.”, “Love grows here.”
];

// — Initialization —
function init() {
loadData();
applyTheme();
setupEventListeners();
startClock();
renderFeeds();
updateTimerDisplay();
requestNotificationPermission();

```
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}
```

}

// — Data Persistence —
function loadData() {
const stored = localStorage.getItem(‘nurture_data’);
if (stored) {
const parsed = JSON.parse(stored);
state.feeds = parsed.feeds || [];
state.settings = { …state.settings, …parsed.settings };
}
// Sync settings UI
els.inputs.theme.value = state.settings.theme;
els.inputs.interval.value = state.settings.intervalMinutes;
}

function saveData() {
localStorage.setItem(‘nurture_data’, JSON.stringify({
feeds: state.feeds,
settings: state.settings
}));
}

// — Timer Logic —
function startClock() {
setInterval(() => {
const now = new Date();
els.clock.textContent = now.toLocaleTimeString([], { hour: ‘2-digit’, minute: ‘2-digit’ });
updateTimerDisplay();
}, 1000);
}

function updateTimerDisplay() {
if (state.feeds.length === 0) {
els.mainDisplay.textContent = “–:–”;
els.subDisplay.textContent = “No feeds recorded yet”;
return;
}

```
const lastFeed = state.feeds[0]; // Feeds are sorted DESC
const lastTime = new Date(lastFeed.timestamp).getTime();
const now = Date.now();
const intervalMs = state.settings.intervalMinutes * 60 * 1000;
const nextFeedTime = lastTime + intervalMs;

if (state.viewMode === 'countdown') {
    const diff = nextFeedTime - now;
    
    if (diff <= 0) {
        // Overdue
        els.mainDisplay.textContent = "00:00";
        els.mainDisplay.style.color = "var(--danger-color)";
        els.subDisplay.textContent = "Feed Overdue";
    } else {
        els.mainDisplay.textContent = formatMs(diff);
        els.mainDisplay.style.color = "var(--text-primary)";
        els.subDisplay.textContent = `Due at ${new Date(nextFeedTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    }
    
    checkAlarm(diff);

} else {
    // Stopwatch
    const diff = now - lastTime;
    els.mainDisplay.textContent = formatMs(diff);
    els.mainDisplay.style.color = "var(--text-primary)";
    els.subDisplay.textContent = `Last feed: ${new Date(lastTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
}
```

}

let alarmTriggered = false;
function checkAlarm(diff) {
// Trigger alarm if we cross the 0 threshold (approx) and haven’t triggered yet
if (diff <= 0 && diff > -5000 && !alarmTriggered) {
alarmTriggered = true;
sendNotification();
}
// Reset alarm trigger if user adds a feed
if (diff > 0) alarmTriggered = false;
}

function formatMs(ms) {
const totalSeconds = Math.floor(Math.abs(ms) / 1000);
const h = Math.floor(totalSeconds / 3600);
const m = Math.floor((totalSeconds % 3600) / 60);
const s = totalSeconds % 60;
if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
return `${m}:${pad(s)}`;
}

function pad(num) { return num.toString().padStart(2, ‘0’); }

// — Core Actions —
function startFeed() {
const now = new Date();
const newFeed = {
id: Date.now().toString(),
timestamp: now.toISOString(),
type: ‘Left’, // Default
amount: ‘’,
notes: ‘’
};

```
state.feeds.unshift(newFeed); // Add to beginning
saveData();
renderFeeds();
updateTimerDisplay();

// Random Encouragement
els.encouragement.textContent = messages[Math.floor(Math.random() * messages.length)];

// Reset alarm state
alarmTriggered = false;
```

}

// — Rendering Feeds —
function renderFeeds() {
// Sort Descending
state.feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

```
const html = state.feeds.map(feed => {
    const date = new Date(feed.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString();
    const info = [feed.type, feed.amount ? `${feed.amount}ml` : null].filter(Boolean).join(' • ');

    return `
        <li class="feed-item" onclick="openEditModal('${feed.id}')">
            <div class="feed-info">
                <h4>${timeStr} <span style="font-weight:400; opacity:0.7; font-size:0.8em">(${dateStr})</span></h4>
                <p>${info} ${feed.notes ? '• 📝' : ''}</p>
            </div>
            <button class="feed-edit-btn">Edit</button>
        </li>
    `;
}).join('');

els.feedListPreview.innerHTML = html;
els.feedListFull.innerHTML = html;

renderStats();
```

}

// — Stats —
function renderStats() {
if (!state.feeds.length) return;

```
const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

// Feeds last 24h
const feeds24h = state.feeds.filter(f => (now - new Date(f.timestamp).getTime()) < oneDay);
document.getElementById('stat-count-24').textContent = feeds24h.length;

// Avg Interval
if (state.feeds.length > 1) {
    let totalDiff = 0;
    let count = 0;
    for(let i = 0; i < Math.min(state.feeds.length - 1, 10); i++) {
        const t1 = new Date(state.feeds[i].timestamp);
        const t2 = new Date(state.feeds[i+1].timestamp);
        totalDiff += (t1 - t2);
        count++;
    }
    const avgMs = totalDiff / count;
    const avgHrs = (avgMs / (1000 * 60 * 60)).toFixed(1);
    document.getElementById('stat-avg-time').textContent = `${avgHrs}h`;
}
```

}

// — Modals & Editing —
function openEditModal(id) {
const feed = state.feeds.find(f => f.id === id);
if (!feed) return;

```
els.modal.id.value = feed.id;
// Format datetime-local: YYYY-MM-DDThh:mm
const d = new Date(feed.timestamp);
d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
els.modal.time.value = d.toISOString().slice(0,16);

els.modal.typeInput.value = feed.type || 'Left';
updateChipUI(feed.type || 'Left');
els.modal.amount.value = feed.amount || '';
els.modal.notes.value = feed.notes || '';

els.modal.overlay.classList.remove('hidden');
```

}

function closeEditModal() {
els.modal.overlay.classList.add(‘hidden’);
}

function saveEdit() {
const id = els.modal.id.value;
const idx = state.feeds.findIndex(f => f.id === id);
if (idx > -1) {
state.feeds[idx] = {
…state.feeds[idx],
timestamp: new Date(els.modal.time.value).toISOString(),
type: els.modal.typeInput.value,
amount: els.modal.amount.value,
notes: els.modal.notes.value
};
saveData();
renderFeeds();
closeEditModal();
}
}

function deleteEntry() {
if(!confirm(“Delete this feed?”)) return;
const id = els.modal.id.value;
state.feeds = state.feeds.filter(f => f.id !== id);
saveData();
renderFeeds();
closeEditModal();
}

// — UI Helpers —
function updateChipUI(val) {
document.querySelectorAll(’.chip’).forEach(c => {
if(c.dataset.val === val) c.classList.add(‘selected’);
else c.classList.remove(‘selected’);
});
els.modal.typeInput.value = val;
}

function showView(viewName) {
Object.values(els.views).forEach(el => el.classList.add(‘hidden’));
if(viewName === ‘home’) els.views.home.classList.remove(‘hidden’);
if(viewName === ‘stats’) els.views.stats.classList.remove(‘hidden’);
if(viewName === ‘settings’) els.views.settings.classList.remove(‘hidden’);
}

function applyTheme() {
document.body.setAttribute(‘data-theme’, state.settings.theme);
}

// — Notifications —
function requestNotificationPermission() {
if (“Notification” in window && Notification.permission !== “granted”) {
Notification.requestPermission();
}
}

function sendNotification() {
if (Notification.permission === “granted”) {
const intervalHr = (state.settings.intervalMinutes / 60).toFixed(1);
new Notification(“Time to Feed!”, {
body: `${intervalHr} hours have passed since the last feed.`,
icon: ‘icons/icon-192.png’,
badge: ‘icons/icon-192.png’,
tag: ‘feed-reminder’,
requireInteraction: true, // Keeps notification visible until dismissed
vibrate: [200, 100, 200] // Adds vibration pattern for mobile
});
}
}

// — Event Listeners —
function setupEventListeners() {
// Toggles
els.toggleCountdown.onclick = () => {
state.viewMode = ‘countdown’;
els.toggleCountdown.classList.add(‘active’);
els.toggleStopwatch.classList.remove(‘active’);
updateTimerDisplay();
};
els.toggleStopwatch.onclick = () => {
state.viewMode = ‘stopwatch’;
els.toggleStopwatch.classList.add(‘active’);
els.toggleCountdown.classList.remove(‘active’);
updateTimerDisplay();
};

```
// Buttons
els.startBtn.onclick = startFeed;
els.btnSettings.onclick = () => showView('settings');
els.btnStats.onclick = () => showView('stats');

// Modal actions
els.modal.saveBtn.onclick = saveEdit;
els.modal.delBtn.onclick = deleteEntry;
els.modal.typeGroup.addEventListener('click', (e) => {
    if(e.target.classList.contains('chip')) updateChipUI(e.target.dataset.val);
});

// Settings inputs
els.inputs.theme.onchange = (e) => {
    state.settings.theme = e.target.value;
    applyTheme();
    saveData();
};
els.inputs.interval.onchange = (e) => {
    state.settings.intervalMinutes = parseInt(e.target.value);
    saveData();
    updateTimerDisplay();
};

document.getElementById('btn-clear-data').onclick = () => {
    if(confirm("Delete ALL history? This cannot be undone.")) {
        state.feeds = [];
        saveData();
        renderFeeds();
    }
};
document.getElementById('btn-export').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.feeds));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "feed_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
```

}

// Init App
document.addEventListener(‘DOMContentLoaded’, init);