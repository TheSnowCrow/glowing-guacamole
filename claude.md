# WorkDay Tracker - Web Application Specification

## Project Overview
Build a single-page web application for time-tracking and workday planning that integrates into the physicianpromptengineering.com website. This tool will help users implement their daily time-block plans with an intuitive, visual interface inspired by smartphone app launchers.

### Target URL
`https://physicianpromptengineering.com/workday-tracker/`

### Core Value Proposition
- **Effortless task switching**: Click an icon to instantly switch what you're working on
- **Visual organization**: Manage tasks with a grid-based icon system similar to smartphone home screens
- **Deep analytics**: Comprehensive end-of-day review with multiple visualization methods
- **Time block implementation**: Help users stick to their planned workday structure
- **Browser-based**: No installation required, works on any device with a modern browser

---

## Technical Stack

### Frontend Technologies
- **HTML5**: Semantic markup
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript (ES6+)**: No frameworks required (consistent with existing tools)
- **LocalStorage API**: Client-side data persistence
- **Canvas API or Chart.js**: For data visualizations (pie charts, timelines, bar graphs)
- **Web Notifications API**: For Pomodoro timer alerts

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### External Libraries (Minimal)
- **Chart.js** (v4.x): For analytics visualizations
- **Optional**: Sortable.js for advanced drag-and-drop if native HTML5 drag/drop proves insufficient
- **Optional**: date-fns or Day.js for date manipulation (lightweight alternative to Moment.js)

---

## Integration with Existing Site

### Page Structure (Following Clinic Visit Tracker Pattern)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkDay Tracker - Physician Prompt Engineering</title>
    <!-- Existing site CSS -->
    <link rel="stylesheet" href="../path-to-main-site.css">
    <!-- Tool-specific CSS -->
    <link rel="stylesheet" href="workday-tracker.css">
</head>
<body>
    <!-- Site header/navigation (if applicable) -->
    
    <main class="container">
        <h1>WorkDay Tracker</h1>
        
        <!-- Warning box (consistent with clinic tracker) -->
        <div class="alert alert-warning">
            ⚠️ <strong>Important:</strong> Your workday data is stored in your browser's local storage. 
            Export your data regularly to avoid losing it if you clear your browser cache or use a different device.
        </div>
        
        <!-- Main application container -->
        <div id="workday-app">
            <!-- App content injected here -->
        </div>
    </main>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="workday-tracker.js"></script>
</body>
</html>
```

### CSS Architecture

Following the existing site's design patterns, use a modular CSS approach:

```
workday-tracker.css
├── Variables (colors, spacing, breakpoints)
├── Base styles
├── Layout (grid, containers)
├── Components (buttons, cards, icons)
├── States (active, hover, disabled)
└── Responsive (mobile, tablet, desktop)
```

---

## Application Architecture

### Single Page Application Structure

The app operates as a state machine with multiple views rendered dynamically:

```javascript
const AppState = {
    currentView: 'home', // home, analytics, pomodoro, journal, settings, onboarding
    currentDay: null,    // WorkDay object or null
    activeTask: null,    // Currently tracking task
    tasks: [],           // Array of all tasks
    folders: [],         // Array of all folders
    workDays: [],        // Historical data
    settings: {},        // User preferences
    isTracking: false    // Whether day has started
};
```

### Data Models (JavaScript Objects)

#### Task Object
```javascript
{
    id: 'task-uuid-1234',
    name: 'Deep Work',
    icon: '📝',              // Emoji or unicode
    color: '#3B82F6',        // Hex color
    shape: 'circle',         // circle, square, rounded-square, diamond, etc.
    parentFolder: null,      // Folder ID or null for top-level
    createdDate: '2025-11-17T10:00:00Z',
    lastUsedDate: '2025-11-17T14:30:00Z',
    isFavorite: false,
    sortOrder: 0,
    totalTimeToday: 0,       // Cached for performance
    totalTimeAllTime: 0
}
```

#### Folder Object
```javascript
{
    id: 'folder-uuid-5678',
    name: 'Communication',
    color: '#10B981',
    parentFolder: null,
    tasks: ['task-uuid-1', 'task-uuid-2'], // Array of task/folder IDs
    createdDate: '2025-11-17T09:00:00Z',
    sortOrder: 1,
    isExpanded: false        // For UI state
}
```

#### TimeEntry Object
```javascript
{
    id: 'entry-uuid-9012',
    taskId: 'task-uuid-1234',
    startTime: '2025-11-17T09:00:00Z',
    endTime: '2025-11-17T10:30:00Z',  // null if currently active
    duration: 5400,          // Seconds (calculated on end)
    dayId: 'day-uuid-3456',
    manual: false            // True if manually edited
}
```

#### WorkDay Object
```javascript
{
    id: 'day-uuid-3456',
    date: '2025-11-17',      // YYYY-MM-DD
    startTime: '2025-11-17T08:00:00Z',
    endTime: '2025-11-17T17:30:00Z',  // null if day not ended
    entries: ['entry-uuid-1', 'entry-uuid-2'],
    journalEntry: {
        text: 'Great day! Completed feature X...',
        mood: '😊',
        energy: 4
    },
    pomodorosCompleted: 8,
    totalDuration: 34200     // Seconds (calculated)
}
```

#### Settings Object
```javascript
{
    pomodoro: {
        workDuration: 1500,      // 25 minutes in seconds
        shortBreak: 300,         // 5 minutes
        longBreak: 900,          // 15 minutes
        longBreakInterval: 4     // Pomodoros before long break
    },
    notifications: {
        enabled: true,
        sound: true
    },
    display: {
        iconSize: 'medium',      // small, medium, large
        gridColumns: 4,          // 3, 4, 5
        theme: 'auto'            // light, dark, auto
    },
    defaultIdleTaskId: 'task-idle-default'
}
```

### LocalStorage Schema

All data stored in localStorage with prefixed keys:

```javascript
// Storage keys
localStorage.setItem('wdt_tasks', JSON.stringify(tasks));
localStorage.setItem('wdt_folders', JSON.stringify(folders));
localStorage.setItem('wdt_workdays', JSON.stringify(workDays));
localStorage.setItem('wdt_entries', JSON.stringify(entries));
localStorage.setItem('wdt_settings', JSON.stringify(settings));
localStorage.setItem('wdt_currentDay', JSON.stringify(currentDay));
localStorage.setItem('wdt_activeTask', JSON.stringify(activeTask));
```

**Data Persistence Strategy:**
- Save on every state change (debounced to prevent excessive writes)
- Load on page load
- Validate data integrity on load (handle corrupted data gracefully)
- Provide export/import functionality for backup

---

## User Interface Design

### Layout Structure

The page uses a tab-based interface similar to the clinic visit tracker:

```
┌─────────────────────────────────────────────────────┐
│  WorkDay Tracker                                    │
│  ⚠️ Important: Your data is stored locally...      │
├─────────────────────────────────────────────────────┤
│  [Home] [Analytics] [Pomodoro] [Journal] [Settings]│ ← Tab Navigation
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Tab Content Area]                                 │
│                                                     │
│  Changes based on active tab                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tab 1: Home View (Main Time Tracker)

This is the primary interface where users spend most of their time.

#### Top Status Bar
```html
<div class="status-bar">
    <div class="day-status">
        <span class="status-label">Day Timer:</span>
        <span class="day-timer" id="dayTimer">3h 24m</span>
    </div>
    <div class="current-task">
        <span class="status-label">Current:</span>
        <span class="task-name" id="currentTaskName">Deep Work</span>
        <span class="task-timer" id="taskTimer">45m 12s</span>
    </div>
    <div class="day-controls">
        <button id="startDayBtn" class="btn btn-success">Start Day</button>
        <button id="endDayBtn" class="btn btn-danger" style="display:none">End Day</button>
    </div>
</div>
```

**Visual Design:**
- Sticky header (stays visible on scroll)
- Large, readable timers (24px+ font)
- Current task highlighted with accent color
- Start/End day buttons prominent

#### Task Grid

Mimics smartphone home screen layout:

```html
<div class="task-grid" id="taskGrid">
    <!-- Breadcrumb for folder navigation -->
    <div class="breadcrumb" id="breadcrumb">
        <span class="crumb" data-folder="root">Home</span>
    </div>
    
    <!-- Task Icons Container -->
    <div class="task-icons" id="taskIcons">
        <!-- Individual task icon -->
        <div class="task-icon" data-task-id="task-123" draggable="true">
            <div class="icon-shape circle" style="background-color: #3B82F6;">
                <span class="icon-emoji">📝</span>
            </div>
            <div class="icon-label">Deep Work</div>
            <div class="time-indicator">2h 15m</div>
        </div>
        
        <!-- Folder icon -->
        <div class="task-icon folder" data-folder-id="folder-456">
            <div class="icon-shape folder-preview">
                <div class="mini-icons">
                    <span>📧</span><span>📞</span>
                    <span>💬</span><span>🗓️</span>
                </div>
            </div>
            <div class="icon-label">Communication</div>
            <div class="time-indicator">1h 30m</div>
        </div>
        
        <!-- Add new task button -->
        <div class="task-icon add-task" id="addTaskBtn">
            <div class="icon-shape circle" style="background-color: #E5E7EB;">
                <span class="icon-emoji">➕</span>
            </div>
            <div class="icon-label">Add Task</div>
        </div>
    </div>
</div>
```

**CSS Grid Layout:**
```css
.task-icons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
}

@media (max-width: 768px) {
    .task-icons {
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }
}

.task-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.task-icon:hover {
    transform: scale(1.05);
}

.task-icon.active .icon-shape {
    border: 3px solid #3B82F6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    animation: pulse 2s infinite;
}

.icon-shape {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    border-radius: 50%;
    margin-bottom: 8px;
    transition: all 0.3s ease;
}

.icon-shape.circle { border-radius: 50%; }
.icon-shape.square { border-radius: 0; }
.icon-shape.rounded-square { border-radius: 15px; }
.icon-shape.diamond { transform: rotate(45deg); }
/* etc. */

.icon-label {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time-indicator {
    font-size: 10px;
    color: #6B7280;
    margin-top: 4px;
}
```

#### Quick Actions Bar
```html
<div class="quick-actions">
    <button class="btn btn-outline" id="pomodoroBtn">
        🍅 Start Pomodoro
    </button>
    <button class="btn btn-outline" id="quickNoteBtn">
        📝 Quick Note
    </button>
</div>
```

### Tab 2: Analytics View

#### Date Selector
```html
<div class="analytics-header">
    <div class="date-selector">
        <button class="btn-nav" id="prevDay">&lt;</button>
        <input type="date" id="analyticsDate" value="2025-11-17">
        <button class="btn-nav" id="nextDay">&gt;</button>
        <button class="btn-outline" id="todayBtn">Today</button>
    </div>
    
    <div class="view-switcher">
        <button class="btn-tab active" data-view="day">Day</button>
        <button class="btn-tab" data-view="week">Week</button>
        <button class="btn-tab" data-view="month">Month</button>
    </div>
</div>
```

#### Summary Cards
```html
<div class="summary-cards">
    <div class="card">
        <div class="card-label">Total Time</div>
        <div class="card-value" id="totalTime">7h 34m</div>
    </div>
    <div class="card">
        <div class="card-label">Tasks Completed</div>
        <div class="card-value" id="tasksCompleted">12</div>
    </div>
    <div class="card">
        <div class="card-label">Pomodoros</div>
        <div class="card-value" id="pomodorosCount">8</div>
    </div>
    <div class="card">
        <div class="card-label">Most Productive</div>
        <div class="card-value" id="topTask">Deep Work</div>
    </div>
</div>
```

#### Visualization Area
```html
<div class="visualizations">
    <!-- Pie Chart -->
    <div class="viz-container">
        <h3>Time by Category</h3>
        <canvas id="categoryPieChart"></canvas>
    </div>
    
    <!-- Timeline -->
    <div class="viz-container">
        <h3>Daily Timeline</h3>
        <canvas id="timelineChart"></canvas>
    </div>
    
    <!-- Bar Chart -->
    <div class="viz-container">
        <h3>Top Tasks</h3>
        <canvas id="tasksBarChart"></canvas>
    </div>
</div>
```

#### Detailed Task List
```html
<div class="task-breakdown">
    <h3>Task Breakdown</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Task</th>
                <th>Category</th>
                <th>Time</th>
                <th>%</th>
                <th>Switches</th>
            </tr>
        </thead>
        <tbody id="taskBreakdownTable">
            <!-- Populated by JS -->
        </tbody>
    </table>
</div>
```

#### Export Section
```html
<div class="export-section">
    <h3>Export Data</h3>
    <div class="export-controls">
        <select id="exportRange">
            <option value="today">Today Only</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
        </select>
        <button class="btn btn-primary" id="exportCSV">
            📊 Export to CSV
        </button>
        <button class="btn btn-outline" id="exportJSON">
            💾 Export to JSON
        </button>
    </div>
</div>
```

### Tab 3: Pomodoro Timer

```html
<div class="pomodoro-container">
    <div class="pomodoro-timer">
        <div class="timer-display">
            <canvas id="pomodoroCanvas" width="300" height="300"></canvas>
            <div class="timer-text">
                <div class="timer-minutes" id="pomodoroMinutes">25</div>
                <div class="timer-colon">:</div>
                <div class="timer-seconds" id="pomodoroSeconds">00</div>
            </div>
        </div>
        
        <div class="session-type" id="sessionType">Work Session</div>
        
        <div class="pomodoro-progress">
            <span class="pomodoro-dot filled"></span>
            <span class="pomodoro-dot filled"></span>
            <span class="pomodoro-dot filled"></span>
            <span class="pomodoro-dot"></span>
        </div>
        
        <div class="current-task-label">
            Current Task: <span id="pomodoroCurrentTask">Deep Work</span>
        </div>
        
        <div class="pomodoro-controls">
            <button class="btn btn-large btn-success" id="pomodoroStart">Start</button>
            <button class="btn btn-large btn-danger" id="pomodoroStop" style="display:none">Stop</button>
            <button class="btn btn-outline" id="pomodoroSkip">Skip Break</button>
        </div>
    </div>
    
    <div class="pomodoro-settings">
        <h3>Pomodoro Settings</h3>
        <div class="setting-row">
            <label>Work Duration:</label>
            <input type="number" id="workDuration" value="25" min="5" max="60"> minutes
        </div>
        <div class="setting-row">
            <label>Short Break:</label>
            <input type="number" id="shortBreak" value="5" min="1" max="15"> minutes
        </div>
        <div class="setting-row">
            <label>Long Break:</label>
            <input type="number" id="longBreak" value="15" min="5" max="30"> minutes
        </div>
        <div class="setting-row">
            <label>Long Break After:</label>
            <input type="number" id="longBreakInterval" value="4" min="2" max="6"> pomodoros
        </div>
        <button class="btn btn-primary" id="savePomodoroSettings">Save Settings</button>
    </div>
    
    <div class="pomodoro-stats">
        <h3>Today's Pomodoros</h3>
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-value" id="pomodorosToday">8</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="focusTime">3h 20m</div>
                <div class="stat-label">Focus Time</div>
            </div>
        </div>
    </div>
</div>
```

**Circular Timer with Canvas:**
```javascript
function drawPomodoroTimer(canvas, percentage, sessionType) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 15;
    ctx.stroke();
    
    // Progress arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (-0.5 + 2 * percentage) * Math.PI);
    ctx.strokeStyle = sessionType === 'work' ? '#3B82F6' : '#10B981';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
}
```

### Tab 4: Journal

```html
<div class="journal-container">
    <div class="journal-header">
        <h2>Daily Journal</h2>
        <div class="date-selector">
            <button class="btn-nav" id="journalPrevDay">&lt;</button>
            <input type="date" id="journalDate" value="2025-11-17">
            <button class="btn-nav" id="journalNextDay">&gt;</button>
        </div>
    </div>
    
    <div class="journal-entry">
        <div class="entry-header">
            <div class="mood-selector">
                <label>How was your day?</label>
                <div class="mood-options">
                    <button class="mood-btn" data-mood="😊">😊</button>
                    <button class="mood-btn" data-mood="😐">😐</button>
                    <button class="mood-btn" data-mood="😞">😞</button>
                    <button class="mood-btn" data-mood="😤">😤</button>
                    <button class="mood-btn" data-mood="🤩">🤩</button>
                </div>
            </div>
            
            <div class="energy-selector">
                <label>Energy Level:</label>
                <div class="energy-options">
                    <button class="energy-btn" data-energy="1">⚡</button>
                    <button class="energy-btn" data-energy="2">⚡⚡</button>
                    <button class="energy-btn" data-energy="3">⚡⚡⚡</button>
                    <button class="energy-btn" data-energy="4">⚡⚡⚡⚡</button>
                    <button class="energy-btn" data-energy="5">⚡⚡⚡⚡⚡</button>
                </div>
            </div>
        </div>
        
        <div class="journal-editor">
            <div class="editor-toolbar">
                <button class="toolbar-btn" data-command="bold" title="Bold">
                    <strong>B</strong>
                </button>
                <button class="toolbar-btn" data-command="italic" title="Italic">
                    <em>I</em>
                </button>
                <button class="toolbar-btn" data-command="insertUnorderedList" title="Bullet List">
                    • List
                </button>
                <button class="toolbar-btn" data-command="insertOrderedList" title="Numbered List">
                    1. List
                </button>
            </div>
            
            <div contenteditable="true" class="editor-content" id="journalEditor">
                <!-- Rich text content -->
            </div>
        </div>
        
        <div class="journal-prompts">
            <button class="prompt-btn" data-prompt="wins">What went well today?</button>
            <button class="prompt-btn" data-prompt="improve">What could be improved?</button>
            <button class="prompt-btn" data-prompt="learned">What did you learn?</button>
            <button class="prompt-btn" data-prompt="tomorrow">Top priorities for tomorrow?</button>
        </div>
        
        <button class="btn btn-primary" id="saveJournal">Save Entry</button>
    </div>
    
    <div class="journal-history">
        <h3>Past Entries</h3>
        <div id="journalList">
            <!-- List of past journal entries -->
        </div>
    </div>
</div>
```

### Tab 5: Settings

```html
<div class="settings-container">
    <h2>Settings</h2>
    
    <section class="settings-section">
        <h3>Display</h3>
        <div class="setting-row">
            <label>Icon Size:</label>
            <select id="iconSize">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
            </select>
        </div>
        <div class="setting-row">
            <label>Grid Columns:</label>
            <select id="gridColumns">
                <option value="3">3</option>
                <option value="4" selected>4</option>
                <option value="5">5</option>
            </select>
        </div>
        <div class="setting-row">
            <label>Theme:</label>
            <select id="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto" selected>Auto</option>
            </select>
        </div>
    </section>
    
    <section class="settings-section">
        <h3>Notifications</h3>
        <div class="setting-row">
            <label>Enable Notifications:</label>
            <input type="checkbox" id="notificationsEnabled" checked>
        </div>
        <div class="setting-row">
            <label>Sound Alerts:</label>
            <input type="checkbox" id="soundEnabled" checked>
        </div>
        <button class="btn btn-outline" id="testNotification">Test Notification</button>
    </section>
    
    <section class="settings-section">
        <h3>Data Management</h3>
        <div class="setting-row">
            <button class="btn btn-primary" id="exportAllData">
                📊 Export All Data (JSON)
            </button>
        </div>
        <div class="setting-row">
            <label>Import Data:</label>
            <input type="file" id="importFile" accept=".json">
            <button class="btn btn-outline" id="importData">Import</button>
        </div>
        <div class="setting-row">
            <button class="btn btn-warning" id="clearOldData">
                🗑️ Clear Data Older Than 90 Days
            </button>
        </div>
        <div class="setting-row">
            <button class="btn btn-danger" id="resetApp">
                ⚠️ Reset App (Delete All Data)
            </button>
        </div>
    </section>
    
    <section class="settings-section">
        <h3>About</h3>
        <p>WorkDay Tracker v1.0</p>
        <p>Created by Physician Prompt Engineering</p>
        <p><a href="mailto:support@example.com">Contact Support</a></p>
    </section>
</div>
```

---

## Modal Dialogs

### Create/Edit Task Modal

```html
<div class="modal" id="taskModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="taskModalTitle">Create New Task</h3>
            <button class="modal-close" id="closeTaskModal">&times;</button>
        </div>
        
        <div class="modal-body">
            <div class="form-group">
                <label>Task Name:</label>
                <input type="text" id="taskName" placeholder="e.g., Deep Work" maxlength="20">
            </div>
            
            <div class="form-group">
                <label>Icon/Emoji:</label>
                <div class="icon-picker">
                    <input type="text" id="taskIcon" maxlength="2" placeholder="📝">
                    <div class="emoji-grid">
                        <button class="emoji-option">📝</button>
                        <button class="emoji-option">💻</button>
                        <button class="emoji-option">📧</button>
                        <button class="emoji-option">📞</button>
                        <button class="emoji-option">🗓️</button>
                        <button class="emoji-option">📊</button>
                        <button class="emoji-option">✏️</button>
                        <button class="emoji-option">🎯</button>
                        <!-- More emojis -->
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Color:</label>
                <div class="color-picker">
                    <button class="color-option" style="background: #EF4444;"></button>
                    <button class="color-option" style="background: #F59E0B;"></button>
                    <button class="color-option" style="background: #10B981;"></button>
                    <button class="color-option" style="background: #3B82F6;"></button>
                    <button class="color-option" style="background: #8B5CF6;"></button>
                    <button class="color-option" style="background: #EC4899;"></button>
                    <!-- More colors -->
                </div>
            </div>
            
            <div class="form-group">
                <label>Shape:</label>
                <div class="shape-picker">
                    <button class="shape-option" data-shape="circle">
                        <div class="shape-preview circle"></div>
                        Circle
                    </button>
                    <button class="shape-option" data-shape="square">
                        <div class="shape-preview square"></div>
                        Square
                    </button>
                    <button class="shape-option" data-shape="rounded-square">
                        <div class="shape-preview rounded-square"></div>
                        Rounded
                    </button>
                    <button class="shape-option" data-shape="diamond">
                        <div class="shape-preview diamond"></div>
                        Diamond
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label>Folder/Category:</label>
                <select id="taskParentFolder">
                    <option value="">Top Level (No Folder)</option>
                    <!-- Populated dynamically -->
                </select>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-outline" id="cancelTask">Cancel</button>
            <button class="btn btn-primary" id="saveTask">Save Task</button>
        </div>
    </div>
</div>
```

### Onboarding Wizard Modal

```html
<div class="modal modal-large" id="onboardingModal">
    <div class="modal-content">
        <div class="onboarding-step" data-step="1">
            <h2>Welcome to WorkDay Tracker!</h2>
            <p>Track your time effortlessly and implement your daily time-block plan.</p>
            <img src="onboarding-hero.svg" alt="WorkDay Tracker">
            <button class="btn btn-primary" onclick="nextOnboardingStep()">Get Started</button>
        </div>
        
        <div class="onboarding-step" data-step="2" style="display:none;">
            <h2>How It Works</h2>
            <ul class="feature-list">
                <li>🎯 Click any task icon to start tracking time</li>
                <li>📁 Organize tasks into folders by dragging</li>
                <li>📊 Review your day with detailed analytics</li>
                <li>🍅 Use Pomodoro timer to stay focused</li>
            </ul>
            <button class="btn btn-outline" onclick="prevOnboardingStep()">Back</button>
            <button class="btn btn-primary" onclick="nextOnboardingStep()">Continue</button>
        </div>
        
        <div class="onboarding-step" data-step="3" style="display:none;">
            <h2>Let's Create Your First Tasks</h2>
            <p>We can set up some common categories, or you can start from scratch.</p>
            
            <div class="preset-options">
                <button class="preset-btn" id="usePresets">
                    Use Suggested Tasks
                    <small>Deep Work, Communication, Planning, etc.</small>
                </button>
                <button class="preset-btn" id="startBlank">
                    Start from Scratch
                    <small>Create your own tasks</small>
                </button>
            </div>
        </div>
        
        <div class="onboarding-step" data-step="4" style="display:none;">
            <h2>You're All Set!</h2>
            <p>Click "Start Day" to begin tracking your time.</p>
            <button class="btn btn-primary btn-large" id="finishOnboarding">Start Tracking</button>
        </div>
    </div>
</div>
```

---

## Core JavaScript Functionality

### App Initialization

```javascript
// Main App Object
const WorkDayTracker = {
    state: {
        currentView: 'home',
        currentDay: null,
        activeTask: null,
        tasks: [],
        folders: [],
        workDays: [],
        settings: {},
        isTracking: false,
        currentFolder: null, // For navigation
        pomodoroState: {
            isRunning: false,
            sessionType: 'work',
            remainingSeconds: 1500,
            pomodorosCompleted: 0
        }
    },
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeTimer();
        this.checkFirstRun();
        this.render();
    },
    
    loadFromStorage() {
        const tasks = localStorage.getItem('wdt_tasks');
        if (tasks) this.state.tasks = JSON.parse(tasks);
        
        const folders = localStorage.getItem('wdt_folders');
        if (folders) this.state.folders = JSON.parse(folders);
        
        const workDays = localStorage.getItem('wdt_workdays');
        if (workDays) this.state.workDays = JSON.parse(workDays);
        
        const settings = localStorage.getItem('wdt_settings');
        if (settings) {
            this.state.settings = JSON.parse(settings);
        } else {
            this.state.settings = this.getDefaultSettings();
        }
        
        const currentDay = localStorage.getItem('wdt_currentDay');
        if (currentDay) {
            const day = JSON.parse(currentDay);
            // Check if it's today
            if (this.isToday(day.date)) {
                this.state.currentDay = day;
                this.state.isTracking = !day.endTime;
            }
        }
        
        const activeTask = localStorage.getItem('wdt_activeTask');
        if (activeTask && this.state.isTracking) {
            this.state.activeTask = JSON.parse(activeTask);
        }
    },
    
    saveToStorage() {
        localStorage.setItem('wdt_tasks', JSON.stringify(this.state.tasks));
        localStorage.setItem('wdt_folders', JSON.stringify(this.state.folders));
        localStorage.setItem('wdt_workdays', JSON.stringify(this.state.workDays));
        localStorage.setItem('wdt_settings', JSON.stringify(this.state.settings));
        localStorage.setItem('wdt_currentDay', JSON.stringify(this.state.currentDay));
        localStorage.setItem('wdt_activeTask', JSON.stringify(this.state.activeTask));
    },
    
    checkFirstRun() {
        const hasRun = localStorage.getItem('wdt_hasRun');
        if (!hasRun) {
            this.showOnboarding();
            localStorage.setItem('wdt_hasRun', 'true');
        }
    },
    
    // More methods...
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    WorkDayTracker.init();
});
```

### Time Tracking Core

```javascript
startDay() {
    const now = new Date();
    const dayId = this.generateUUID();
    
    this.state.currentDay = {
        id: dayId,
        date: this.formatDate(now),
        startTime: now.toISOString(),
        endTime: null,
        entries: [],
        journalEntry: null,
        pomodorosCompleted: 0,
        totalDuration: 0
    };
    
    this.state.isTracking = true;
    
    // Start tracking to Idle task by default
    const idleTask = this.getIdleTask();
    this.switchToTask(idleTask.id);
    
    this.saveToStorage();
    this.render();
},

switchToTask(taskId) {
    const now = new Date();
    
    // End current time entry if exists
    if (this.state.activeTask) {
        const currentEntry = this.getCurrentTimeEntry();
        if (currentEntry) {
            currentEntry.endTime = now.toISOString();
            currentEntry.duration = this.calculateDuration(
                currentEntry.startTime, 
                currentEntry.endTime
            );
        }
    }
    
    // Create new time entry
    const newEntry = {
        id: this.generateUUID(),
        taskId: taskId,
        startTime: now.toISOString(),
        endTime: null,
        duration: 0,
        dayId: this.state.currentDay.id,
        manual: false
    };
    
    this.state.currentDay.entries.push(newEntry.id);
    this.saveTimeEntry(newEntry);
    
    // Update active task
    this.state.activeTask = this.getTaskById(taskId);
    this.state.activeTask.lastUsedDate = now.toISOString();
    
    this.saveToStorage();
    this.updateTimerDisplay();
},

endDay() {
    const confirmed = confirm('End your workday? This will stop tracking and show your daily summary.');
    if (!confirmed) return;
    
    const now = new Date();
    
    // End current time entry
    if (this.state.activeTask) {
        const currentEntry = this.getCurrentTimeEntry();
        if (currentEntry) {
            currentEntry.endTime = now.toISOString();
            currentEntry.duration = this.calculateDuration(
                currentEntry.startTime,
                currentEntry.endTime
            );
        }
    }
    
    // End the day
    this.state.currentDay.endTime = now.toISOString();
    this.state.currentDay.totalDuration = this.calculateDayDuration();
    
    // Archive the day
    this.state.workDays.push(this.state.currentDay);
    
    // Reset state
    this.state.isTracking = false;
    this.state.activeTask = null;
    
    this.saveToStorage();
    
    // Switch to analytics view
    this.switchView('analytics');
},

// Timer update (runs every second)
updateTimer() {
    if (!this.state.isTracking || !this.state.activeTask) return;
    
    const currentEntry = this.getCurrentTimeEntry();
    if (!currentEntry) return;
    
    const elapsed = this.calculateDuration(
        currentEntry.startTime,
        new Date().toISOString()
    );
    
    this.updateTimerDisplay(elapsed);
},

initializeTimer() {
    setInterval(() => {
        this.updateTimer();
        this.updatePomodoroTimer();
    }, 1000);
}
```

### Drag and Drop

```javascript
setupDragAndDrop() {
    const taskGrid = document.getElementById('taskIcons');
    
    taskGrid.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('task-icon')) return;
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', e.target.dataset.taskId || e.target.dataset.folderId);
        e.target.classList.add('dragging');
    });
    
    taskGrid.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });
    
    taskGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingEl = document.querySelector('.dragging');
        const afterElement = this.getDragAfterElement(taskGrid, e.clientY);
        
        if (afterElement == null) {
            taskGrid.appendChild(draggingEl);
        } else {
            taskGrid.insertBefore(draggingEl, afterElement);
        }
    });
    
    taskGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('taskId');
        const targetEl = e.target.closest('.task-icon');
        
        if (!targetEl) return;
        
        const targetId = targetEl.dataset.taskId || targetEl.dataset.folderId;
        
        // If dropped on another task, create folder
        if (targetId && draggedId !== targetId) {
            this.createFolderFromTasks(draggedId, targetId);
        }
    });
},

createFolderFromTasks(taskId1, taskId2) {
    const task1 = this.getTaskById(taskId1);
    const task2 = this.getTaskById(taskId2);
    
    const folderName = prompt('Name this folder:', 'New Folder');
    if (!folderName) return;
    
    const folder = {
        id: this.generateUUID(),
        name: folderName,
        color: task1.color,
        parentFolder: this.state.currentFolder,
        tasks: [taskId1, taskId2],
        createdDate: new Date().toISOString(),
        sortOrder: 0
    };
    
    this.state.folders.push(folder);
    
    // Update tasks' parent folder
    task1.parentFolder = folder.id;
    task2.parentFolder = folder.id;
    
    this.saveToStorage();
    this.render();
}
```

### Analytics Generation

```javascript
generateDayAnalytics(dayId) {
    const day = this.state.workDays.find(d => d.id === dayId) || this.state.currentDay;
    if (!day) return null;
    
    const entries = this.getEntriesForDay(day.id);
    
    // Category breakdown
    const categoryData = {};
    entries.forEach(entry => {
        const task = this.getTaskById(entry.taskId);
        const category = this.getCategoryForTask(task);
        
        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += entry.duration;
    });
    
    // Task breakdown
    const taskData = {};
    entries.forEach(entry => {
        if (!taskData[entry.taskId]) {
            taskData[entry.taskId] = {
                duration: 0,
                switches: 0
            };
        }
        taskData[entry.taskId].duration += entry.duration;
        taskData[entry.taskId].switches += 1;
    });
    
    // Timeline data
    const timeline = entries.map(entry => ({
        task: this.getTaskById(entry.taskId),
        start: new Date(entry.startTime),
        end: new Date(entry.endTime),
        duration: entry.duration
    }));
    
    return {
        totalDuration: day.totalDuration,
        categoryData,
        taskData,
        timeline,
        topTask: this.getTopTask(taskData),
        tasksWorkedOn: Object.keys(taskData).length,
        pomodorosCompleted: day.pomodorosCompleted || 0
    };
},

renderPieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', 
                    '#EF4444', '#8B5CF6', '#EC4899'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const seconds = context.parsed;
                            return `${context.label}: ${this.formatDuration(seconds)}`;
                        }
                    }
                }
            }
        }
    });
},

renderTimelineChart(canvasId, timelineData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Create horizontal bar chart representing timeline
    const datasets = timelineData.map(item => ({
        label: item.task.name,
        data: [{
            x: [item.start.getTime(), item.end.getTime()],
            y: item.task.name
        }],
        backgroundColor: item.task.color
    }));
    
    new Chart(ctx, {
        type: 'bar',
        data: { datasets },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour'
                    }
                }
            }
        }
    });
}
```

### CSV Export

```javascript
exportToCSV(dateRange) {
    const entries = this.getEntriesForRange(dateRange);
    
    let csv = 'Report Generated,' + new Date().toISOString() + '\n';
    csv += 'Date Range,' + dateRange + '\n';
    csv += '\n';
    csv += 'Date,Task Name,Category,Start Time,End Time,Duration (minutes)\n';
    
    entries.forEach(entry => {
        const task = this.getTaskById(entry.taskId);
        const category = this.getCategoryForTask(task);
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const durationMins = Math.round(entry.duration / 60);
        
        csv += `${this.formatDate(start)},`;
        csv += `"${task.name}",`;
        csv += `"${category}",`;
        csv += `${this.formatTime(start)},`;
        csv += `${this.formatTime(end)},`;
        csv += `${durationMins}\n`;
    });
    
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0) / 60;
    csv += `\nTOTAL,,,,${Math.round(totalMinutes)}`;
    
    this.downloadFile('workday-tracker-export.csv', csv, 'text/csv');
},

downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

### Pomodoro Timer

```javascript
startPomodoro() {
    if (!this.state.activeTask) {
        alert('Please select a task first!');
        return;
    }
    
    const sessionType = this.state.pomodoroState.sessionType;
    const duration = this.getPomodoroDuration(sessionType);
    
    this.state.pomodoroState.isRunning = true;
    this.state.pomodoroState.remainingSeconds = duration;
    
    this.pomodoroInterval = setInterval(() => {
        this.tickPomodoro();
    }, 1000);
    
    this.requestNotificationPermission();
},

tickPomodoro() {
    if (this.state.pomodoroState.remainingSeconds <= 0) {
        this.pomodoroComplete();
        return;
    }
    
    this.state.pomodoroState.remainingSeconds--;
    this.updatePomodoroDisplay();
},

pomodoroComplete() {
    clearInterval(this.pomodoroInterval);
    
    const sessionType = this.state.pomodoroState.sessionType;
    
    if (sessionType === 'work') {
        this.state.pomodoroState.pomodorosCompleted++;
        this.state.currentDay.pomodorosCompleted++;
        
        // Determine next break type
        const needsLongBreak = this.state.pomodoroState.pomodorosCompleted % 
            this.state.settings.pomodoro.longBreakInterval === 0;
        
        this.state.pomodoroState.sessionType = needsLongBreak ? 'longBreak' : 'shortBreak';
        
        this.showNotification('Pomodoro Complete!', 'Time for a break!');
    } else {
        this.state.pomodoroState.sessionType = 'work';
        this.showNotification('Break Over!', 'Ready to focus again?');
    }
    
    this.state.pomodoroState.isRunning = false;
    this.saveToStorage();
    this.render();
},

showNotification(title, body) {
    if (!this.state.settings.notifications.enabled) return;
    
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/path-to-icon.png',
            badge: '/path-to-badge.png'
        });
        
        if (this.state.settings.notifications.sound) {
            this.playNotificationSound();
        }
    }
},

requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
```

### Rich Text Journal Editor

```javascript
initializeJournalEditor() {
    const editor = document.getElementById('journalEditor');
    const toolbar = document.querySelector('.editor-toolbar');
    
    toolbar.addEventListener('click', (e) => {
        if (!e.target.classList.contains('toolbar-btn')) return;
        
        const command = e.target.dataset.command;
        document.execCommand(command, false, null);
        editor.focus();
    });
    
    // Auto-save
    editor.addEventListener('input', this.debounce(() => {
        this.saveJournalEntry();
    }, 1000));
},

saveJournalEntry() {
    const editor = document.getElementById('journalEditor');
    const content = editor.innerHTML;
    const selectedDate = document.getElementById('journalDate').value;
    
    const day = this.state.workDays.find(d => d.date === selectedDate) || this.state.currentDay;
    
    if (day) {
        if (!day.journalEntry) {
            day.journalEntry = {};
        }
        day.journalEntry.text = content;
        this.saveToStorage();
    }
}
```

---

## Responsive Design

### Mobile Breakpoints

```css
/* Mobile First Approach */

/* Extra Small Devices (phones, <576px) */
@media (max-width: 575.98px) {
    .task-icons {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 15px;
    }
    
    .icon-shape {
        width: 60px;
        height: 60px;
        font-size: 30px;
    }
    
    .status-bar {
        flex-direction: column;
        gap: 10px;
    }
    
    .visualizations {
        grid-template-columns: 1fr;
    }
}

/* Small Devices (tablets, ≥576px) */
@media (min-width: 576px) {
    .task-icons {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Medium Devices (desktops, ≥768px) */
@media (min-width: 768px) {
    .visualizations {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Large Devices (large desktops, ≥992px) */
@media (min-width: 992px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
}
```

---

## Performance Optimizations

### Debouncing and Throttling

```javascript
debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
},

throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
```

### Lazy Loading Charts

```javascript
renderChart(chartId, type, data) {
    // Only render if chart is in viewport
    const canvas = document.getElementById(chartId);
    if (!this.isInViewport(canvas)) return;
    
    // Destroy previous chart if exists
    if (this.charts[chartId]) {
        this.charts[chartId].destroy();
    }
    
    this.charts[chartId] = new Chart(canvas, {
        type: type,
        data: data,
        options: this.getChartOptions(type)
    });
},

isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
```

---

## Default Preset Tasks

When user chooses "Use Suggested Tasks" during onboarding:

```javascript
getDefaultPresetTasks() {
    return [
        // Deep Work Folder
        {
            type: 'folder',
            name: 'Deep Work',
            color: '#3B82F6',
            tasks: [
                { name: 'Writing', icon: '✍️', color: '#3B82F6', shape: 'circle' },
                { name: 'Coding', icon: '💻', color: '#1E40AF', shape: 'circle' },
                { name: 'Analysis', icon: '📊', color: '#2563EB', shape: 'circle' },
                { name: 'Design', icon: '🎨', color: '#60A5FA', shape: 'circle' }
            ]
        },
        
        // Communication Folder
        {
            type: 'folder',
            name: 'Communication',
            color: '#10B981',
            tasks: [
                { name: 'Email', icon: '📧', color: '#10B981', shape: 'circle' },
                { name: 'Meetings', icon: '🗓️', color: '#059669', shape: 'circle' },
                { name: 'Calls', icon: '📞', color: '#34D399', shape: 'circle' },
                { name: 'Slack', icon: '💬', color: '#6EE7B7', shape: 'circle' }
            ]
        },
        
        // Planning Folder
        {
            type: 'folder',
            name: 'Planning',
            color: '#F59E0B',
            tasks: [
                { name: 'Daily Planning', icon: '📅', color: '#F59E0B', shape: 'circle' },
                { name: 'Review', icon: '🔍', color: '#D97706', shape: 'circle' },
                { name: 'Strategy', icon: '🎯', color: '#FBBF24', shape: 'circle' }
            ]
        },
        
        // Learning (standalone tasks)
        { name: 'Reading', icon: '📚', color: '#8B5CF6', shape: 'circle' },
        { name: 'Courses', icon: '🎓', color: '#7C3AED', shape: 'circle' },
        
        // Administrative
        { name: 'Admin', icon: '📋', color: '#6B7280', shape: 'rounded-square' },
        
        // Idle (special task)
        { name: 'Idle/Break', icon: '☕', color: '#9CA3AF', shape: 'circle', isIdle: true }
    ];
}
```

---

## Security Considerations

### Input Sanitization

```javascript
sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
},

sanitizeUserInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 100); // Max length
}
```

### XSS Prevention

- Never use `innerHTML` with user-generated content
- Always use `textContent` or sanitize with DOMPurify library
- Validate all data loaded from localStorage

---

## Accessibility (A11Y)

### ARIA Labels and Keyboard Navigation

```html
<!-- Example: Task Icon with A11Y -->
<div class="task-icon" 
     role="button"
     tabindex="0"
     aria-label="Switch to Deep Work task. Current time tracked: 2 hours 15 minutes"
     data-task-id="task-123">
    <div class="icon-shape circle" style="background-color: #3B82F6;">
        <span class="icon-emoji" aria-hidden="true">📝</span>
    </div>
    <div class="icon-label">Deep Work</div>
</div>
```

### Keyboard Shortcuts

```javascript
setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt+S: Start/End Day
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            this.state.isTracking ? this.endDay() : this.startDay();
        }
        
        // Alt+P: Toggle Pomodoro
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            this.switchView('pomodoro');
        }
        
        // Alt+A: View Analytics
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            this.switchView('analytics');
        }
        
        // Alt+N: Add new task
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            this.openTaskModal();
        }
    });
}
```

---

## Testing Checklist

### Functional Testing
- [ ] Create, edit, delete tasks
- [ ] Create folders by dragging
- [ ] Navigate into/out of folders
- [ ] Start/stop day tracking
- [ ] Switch between tasks
- [ ] Time accumulates correctly
- [ ] Pomodoro timer works and sends notifications
- [ ] Journal saves and loads correctly
- [ ] Analytics charts render with correct data
- [ ] CSV export generates valid file
- [ ] Settings persist across sessions
- [ ] LocalStorage data survives page reload

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Testing
- [ ] Mobile (320px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1200px+ width)
- [ ] Orientation changes (portrait/landscape)

### Edge Cases
- [ ] Empty state (no tasks)
- [ ] Many tasks (50+)
- [ ] Deep folder nesting (5 levels)
- [ ] Very long task names
- [ ] Day crossing midnight
- [ ] Browser tab backgrounded for extended time
- [ ] LocalStorage quota exceeded
- [ ] Corrupted localStorage data

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] All interactive elements have labels

---

## Deployment

### File Structure
```
/workday-tracker/
├── index.html
├── css/
│   └── workday-tracker.css
├── js/
│   └── workday-tracker.js
├── assets/
│   ├── icons/
│   └── sounds/
└── README.md
```

### CDN Dependencies
```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- Optional: Sortable.js for drag/drop -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>

<!-- Optional: Day.js for date handling -->
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
```

### SEO Considerations
```html
<meta name="description" content="Track your workday with ease. Implement your time-block plan with visual task management and comprehensive analytics.">
<meta name="keywords" content="time tracking, productivity, workday planner, pomodoro, task management">
<meta property="og:title" content="WorkDay Tracker - Time Blocking Made Easy">
<meta property="og:description" content="Visual time tracking tool for implementing daily time-block plans">
<meta property="og:image" content="/path-to-preview-image.jpg">
```

---

## Future Enhancements (V2)

### Potential Features to Add Later:
1. **Cloud Sync**: Firebase or custom backend for cross-device sync
2. **Collaboration**: Share workspaces with team members
3. **Integrations**: 
   - Calendar import (Google Calendar, Outlook)
   - Export to Todoist, Notion, etc.
4. **Advanced Analytics**:
   - Productivity trends over time
   - Best times of day for different tasks
   - Correlation analysis
5. **Goals & Targets**: Set weekly goals, track progress
6. **Templates**: Save and reuse daily task templates
7. **Customizable Reports**: Weekly/monthly PDF reports
8. **Dark Mode**: Full theme customization
9. **Offline PWA**: Make it a Progressive Web App
10. **Voice Commands**: "Start deep work", "End day"

---

## Success Criteria

The web app should:
- **Load in <2 seconds** on average connection
- **Be fully functional offline** (after initial load)
- **Handle 100+ tasks** without performance degradation
- **Work seamlessly on mobile** (touch-optimized)
- **Never lose data** (robust localStorage with validation)
- **Be intuitive** (new users can start tracking within 60 seconds)
- **Match the style** of existing tools on physicianpromptengineering.com

---

## Development Approach

### Phase 1: Core MVP (Week 1)
1. Set up HTML structure with tabs
2. Implement basic task creation/deletion
3. Build task grid with static icons
4. Add time tracking start/stop/switch
5. Create basic daily summary

### Phase 2: Organization (Week 2)
6. Implement drag & drop
7. Add folder creation and navigation
8. Task customization (colors, icons, shapes)
9. Settings page

### Phase 3: Analytics (Week 3)
10. Integrate Chart.js
11. Build pie chart, timeline, bar chart views
12. Implement CSV export
13. Historical data viewing

### Phase 4: Enhanced Features (Week 4)
14. Pomodoro timer with notifications
15. Journal with rich text editor
16. Onboarding wizard
17. Polish animations and transitions

### Phase 5: Testing & Launch (Week 5)
18. Cross-browser testing
19. Mobile optimization
20. Accessibility audit
21. Performance optimization
22. Deploy to production

---

## Code Style Guidelines

### JavaScript
- Use ES6+ features (const/let, arrow functions, template literals)
- Descriptive variable names (camelCase)
- Comment complex logic
- Keep functions small and focused
- Handle errors gracefully

### CSS
- Mobile-first responsive design
- Use CSS custom properties for colors/spacing
- BEM naming convention for classes
- Avoid !important
- Progressive enhancement

### HTML
- Semantic HTML5 elements
- Meaningful IDs and classes
- Proper heading hierarchy
- Alt text for images
- ARIA labels where needed

---

## Conclusion

This web-based WorkDay Tracker will provide a powerful, accessible time-tracking solution that integrates seamlessly with your existing site. The focus on visual task management, comprehensive analytics, and ease of use will make it valuable for anyone implementing time-block planning.

Key differentiators:
- **Smartphone-inspired UI** makes task switching feel natural
- **Zero friction** - start tracking in seconds
- **Comprehensive analytics** without overwhelming the user
- **Works entirely in-browser** - no signup or installation required
- **Consistent with your existing tools** - matches the design and UX patterns

The tool will help users bridge the gap between planning their ideal workday and actually executing it, with minimal overhead and maximum insight.

Good luck with the development!
