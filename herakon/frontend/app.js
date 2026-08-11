const API_URL = "http://localhost:8000";

const SPORT_ICONS = {
    swim: "🏊",
    bike: "🚴",
    run: "🏃",
    gym: "🏋️"
};

const ENDURANCE_TYPES = [
    { value: "recovery", label: "Recovery" },
    { value: "aerobic", label: "Aerobic" },
    { value: "interval", label: "Interval" },
    { value: "tempo", label: "Tempo" },
    { value: "long", label: "Long" },
    { value: "other", label: "Other" }
];

const GYM_TYPES = [
    { value: "push", label: "Push" },
    { value: "pull", label: "Pull" },
    { value: "legs", label: "Legs" },
    { value: "upper_body", label: "Upper Body" },
    { value: "lower_body", label: "Lower Body" },
    { value: "full_body", label: "Full Body" },
    { value: "core", label: "Core" },
    { value: "other", label: "Other" }
];


// ==================================================
// ELEMENTS — AUTH
// ==================================================

const authPage = document.getElementById("auth-page");
const appPage = document.getElementById("app-page");

const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const showRegisterButton =
    document.getElementById("show-register");

const showLoginButton =
    document.getElementById("show-login");

const logoutButton =
    document.getElementById("logout-button");

const authError =
    document.getElementById("auth-error");

const userName =
    document.getElementById("user-name");


// ==================================================
// ELEMENTS — NAVIGATION / PAGES
// ==================================================

const navTabs =
    document.querySelectorAll(".nav-tab");

const pageSections = {
    today: document.getElementById("today-page"),
    calendar: document.getElementById("calendar-page"),
    projections: document.getElementById("projections-page")
};


// ==================================================
// ELEMENTS — TODAY
// ==================================================

const todayContent =
    document.getElementById("today-content");

const todayDateLabel =
    document.getElementById("today-date-label");

const todayAddButton =
    document.getElementById("today-add-button");


// ==================================================
// ELEMENTS — CALENDAR
// ==================================================

const summaryEls = {
    swim: document.getElementById("summary-swim"),
    bike: document.getElementById("summary-bike"),
    run: document.getElementById("summary-run"),
    gym: document.getElementById("summary-gym"),
    time: document.getElementById("summary-time"),
    count: document.getElementById("summary-count")
};

const allTimeEls = {
    distance: document.getElementById("alltime-distance"),
    time: document.getElementById("alltime-time"),
    count: document.getElementById("alltime-count")
};

const weekRangeLabel =
    document.getElementById("week-range-label");

const calendarGrid =
    document.getElementById("calendar-grid");

const weekPrevButton =
    document.getElementById("week-prev");

const weekThisButton =
    document.getElementById("week-this");

const weekNextButton =
    document.getElementById("week-next");


// ==================================================
// ELEMENTS — PROJECTIONS
// ==================================================

const projectionsGrid =
    document.getElementById("projections-grid");


// ==================================================
// ELEMENTS — WORKOUT MODAL
// ==================================================

const workoutModalOverlay =
    document.getElementById("workout-modal-overlay");

const workoutForm =
    document.getElementById("workout-form");

const workoutFormError =
    document.getElementById("workout-form-error");

const closeWorkoutModalButton =
    document.getElementById("close-workout-modal");

const cancelWorkoutButton =
    document.getElementById("cancel-workout");

const sportSelect =
    document.getElementById("workout-sport");

const typeSelect =
    document.getElementById("workout-type");

const distanceFieldGroup =
    document.getElementById("distance-field-group");

const setsRepsFieldGroup =
    document.getElementById("sets-reps-field-group");

const durationFieldGroup =
    document.getElementById("duration-field-group");

const structuredSetsFieldGroup =
    document.getElementById("structured-sets-field-group");

const structuredSetsList =
    document.getElementById("structured-sets-list");

const addStructuredSetButton =
    document.getElementById("add-structured-set-button");

const structuredSummaryEls = {
    distance: document.getElementById("structured-summary-distance"),
    work: document.getElementById("structured-summary-work"),
    rest: document.getElementById("structured-summary-rest"),
    total: document.getElementById("structured-summary-total")
};

const workoutModalTitle =
    document.getElementById("workout-modal-title");

const workoutFormSubmitButton =
    document.getElementById("workout-form-submit");


// ==================================================
// ELEMENTS — PLANNER PANEL
// ==================================================

const plannerPhaseLabel =
    document.getElementById("planner-phase-label");

const plannerPhaseDescription =
    document.getElementById("planner-phase-description");

const plannerPhaseOverride =
    document.getElementById("planner-phase-override");

const generateNextWeekButton =
    document.getElementById("generate-next-week-button");

const replanWeekButton =
    document.getElementById("replan-week-button");

const plannerPanelMessage =
    document.getElementById("planner-panel-message");


// ==================================================
// ELEMENTS — TODAY PLANNED SECTION
// ==================================================

const todayPlannedContent =
    document.getElementById("today-planned-content");


// ==================================================
// STATE
// ==================================================

let allWorkouts = null;
let loadError = null;
let currentPage = "today";
let weekStart = getMonday(new Date());
let editingWorkoutId = null;   // set when completing a planned workout
let structuredSets = [];       // rows in the current structured-set builder
let structuredSetIdCounter = 0;


// ==================================================
// PROJECTION DEMO DATA
// (replace with real predictions once the
// prediction system is built)
// ==================================================

const PROJECTION_DATA = [
    {
        name: "Olympic Triathlon",
        distanceLabel: "1.5km swim · 40km bike · 10km run",
        total: "2:14:30",
        splits: [
            { label: "Swim", value: "0:22:00" },
            { label: "T1", value: "0:01:30" },
            { label: "Bike", value: "1:05:00" },
            { label: "T2", value: "0:01:00" },
            { label: "Run", value: "0:45:00" }
        ]
    },
    {
        name: "Ironman 70.3",
        distanceLabel: "1.9km swim · 90km bike · 21.1km run",
        total: "5:32:18",
        splits: [
            { label: "Swim", value: "1:10:00" },
            { label: "T1", value: "0:03:00" },
            { label: "Bike", value: "2:35:00" },
            { label: "T2", value: "0:02:00" },
            { label: "Run", value: "1:42:18" }
        ]
    },
    {
        name: "Ironman 140.6",
        distanceLabel: "3.8km swim · 180km bike · 42.2km run",
        total: "11:40:00",
        splits: [
            { label: "Swim", value: "1:12:00" },
            { label: "T1", value: "0:04:00" },
            { label: "Bike", value: "6:15:00" },
            { label: "T2", value: "0:04:00" },
            { label: "Run", value: "4:05:00" }
        ]
    }
];


// ==================================================
// INITIALISE
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {

    const token =
        localStorage.getItem("herakon_token");

    if (!token) {
        showLogin();
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error();
        }

        const user = await response.json();

        showApp(user);

    } catch {

        localStorage.removeItem("herakon_token");

        showLogin();

    }

});


// ==================================================
// LOGIN / REGISTER SWITCHING
// ==================================================

showRegisterButton.addEventListener(
    "click",
    () => {

        clearError();

        loginView.classList.add("hidden");
        registerView.classList.remove("hidden");

    }
);


showLoginButton.addEventListener(
    "click",
    () => {

        clearError();

        registerView.classList.add("hidden");
        loginView.classList.remove("hidden");

    }
);


// ==================================================
// REGISTER
// ==================================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearError();

        const name =
            document.getElementById(
                "register-name"
            ).value;

        const email =
            document.getElementById(
                "register-email"
            ).value;

        const password =
            document.getElementById(
                "register-password"
            ).value;


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Registration failed."
                );
            }


            // Registration worked.
            // Send user to login.

            registerForm.reset();

            loginView.classList.remove(
                "hidden"
            );

            registerView.classList.add(
                "hidden"
            );

            document.getElementById(
                "login-email"
            ).value = email;


            alert(
                "Account created successfully!"
            );

        } catch (error) {

            showError(error.message);

        }

    }
);


// ==================================================
// LOGIN
// ==================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearError();


        const email =
            document.getElementById(
                "login-email"
            ).value;

        const password =
            document.getElementById(
                "login-password"
            ).value;


        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Login failed."
                );
            }


            // Save authentication token

            localStorage.setItem(
                "herakon_token",
                data.token
            );


            // Show app

            loginForm.reset();

            showApp(data.user);

        } catch (error) {

            showError(error.message);

        }

    }
);


// ==================================================
// LOGOUT
// ==================================================

logoutButton.addEventListener(
    "click",
    async () => {

        const token =
            localStorage.getItem(
                "herakon_token"
            );


        try {

            await fetch(
                `${API_URL}/auth/logout`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        } catch {
            // Even if request fails,
            // we'll still log out locally.
        }


        localStorage.removeItem(
            "herakon_token"
        );

        allWorkouts = null;
        currentPage = "today";
        weekStart = getMonday(new Date());

        showLogin();

    }
);


// ==================================================
// AUTH UI FUNCTIONS
// ==================================================

function showLogin() {

    authPage.classList.remove("hidden");
    appPage.classList.add("hidden");

    registerView.classList.add("hidden");
    loginView.classList.remove("hidden");

    clearError();

}


function showApp(user) {

    authPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    userName.textContent = user.name;

    switchPage("today");

    loadWorkouts();
}


function showError(message) {

    authError.textContent =
        message;

    authError.classList.remove(
        "hidden"
    );

}


function clearError() {

    authError.textContent = "";

    authError.classList.add(
        "hidden"
    );

}


// ==================================================
// NAVIGATION
// ==================================================

navTabs.forEach(tab => {

    tab.addEventListener("click", () => {
        switchPage(tab.dataset.page);
    });

});


function switchPage(page) {

    currentPage = page;

    navTabs.forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.page === page
        );
    });

    Object.entries(pageSections).forEach(
        ([key, section]) => {
            section.classList.toggle(
                "hidden",
                key !== page
            );
        }
    );

    renderCurrentPage();
}


function renderCurrentPage() {

    if (currentPage === "today") {
        renderToday();
    } else if (currentPage === "calendar") {
        renderCalendar();
    } else {
        renderProjections();
    }

}


// ==================================================
// LOAD WORKOUTS (shared across Today / Calendar)
// ==================================================

async function loadWorkouts() {

    const token =
        localStorage.getItem(
            "herakon_token"
        );


    if (!token) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/workouts`,
            {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to load workouts."
            );

        }

        allWorkouts = data;
        loadError = null;


    } catch (error) {

        loadError = error.message;

    }

    renderCurrentPage();

}


// ==================================================
// TODAY PAGE
// ==================================================

function renderToday() {

    todayDateLabel.textContent =
        new Date().toLocaleDateString(
            "en-GB",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

    if (allWorkouts === null) {

        todayContent.innerHTML =
            loadError
                ? `<p class="error">${loadError}</p>`
                : `<p class="loading">Loading workouts...</p>`;

        todayPlannedContent.innerHTML = "";

        return;
    }

    const todayStr = toDateStr(new Date());

    const todaysWorkouts = allWorkouts.filter(
        workout =>
            workout.date === todayStr &&
            (workout.status || "completed") === "completed"
    );

    if (todaysWorkouts.length === 0) {

        todayContent.innerHTML = `
            <div class="empty-state">

                <h3>No workouts completed today</h3>

                <p>
                    Nothing logged yet — add your first session of the day.
                </p>

                <button id="today-empty-add-button" class="primary-button">
                    + Add workout
                </button>

            </div>
        `;

        document
            .getElementById("today-empty-add-button")
            .addEventListener(
                "click",
                () => openWorkoutModal(todayStr)
            );

    } else {

        todayContent.innerHTML = `
            <div class="workout-list">
                ${todaysWorkouts.map(workout => createWorkoutHTML(workout)).join("")}
            </div>
        `;

        attachDeleteHandlers(todayContent);

    }

    renderPlannedToday(todayStr);
}


function renderPlannedToday(todayStr) {

    const plannedToday = allWorkouts.filter(
        workout =>
            workout.date === todayStr &&
            workout.status === "planned"
    );

    if (plannedToday.length === 0) {
        todayPlannedContent.innerHTML = "";
        return;
    }

    todayPlannedContent.innerHTML = `
        <div class="planned-today-block">
            <h3>Planned for today</h3>
            <div class="workout-list">
                ${plannedToday.map(workout => createWorkoutHTML(workout)).join("")}
            </div>
        </div>
    `;

    attachDeleteHandlers(todayPlannedContent);
    attachCompleteHandlers(todayPlannedContent);
}


todayAddButton.addEventListener(
    "click",
    () => openWorkoutModal(toDateStr(new Date()))
);


// ==================================================
// CALENDAR PAGE
// ==================================================

weekPrevButton.addEventListener("click", () => {
    weekStart = addDays(weekStart, -7);
    renderCalendar();
});

weekNextButton.addEventListener("click", () => {
    weekStart = addDays(weekStart, 7);
    renderCalendar();
});

weekThisButton.addEventListener("click", () => {
    weekStart = getMonday(new Date());
    renderCalendar();
});


function renderCalendar() {

    const days = getWeekDays(weekStart);
    const weekStartStr = toDateStr(days[0]);
    const weekEndStr = toDateStr(days[6]);

    weekRangeLabel.textContent =
        `${formatShort(days[0])} – ${formatShort(days[6])}`;

    if (allWorkouts === null) {

        calendarGrid.innerHTML =
            loadError
                ? `<p class="error">${loadError}</p>`
                : `<p class="loading">Loading calendar...</p>`;

        renderWeekSummary([]);
        renderAllTimeSummary([]);

        return;
    }

    const weekWorkouts = allWorkouts.filter(
        workout =>
            workout.date >= weekStartStr &&
            workout.date <= weekEndStr
    );

    const completedWeekWorkouts = weekWorkouts.filter(
        workout => (workout.status || "completed") === "completed"
    );

    const completedAllWorkouts = allWorkouts.filter(
        workout => (workout.status || "completed") === "completed"
    );

    renderWeekSummary(completedWeekWorkouts);
    renderAllTimeSummary(completedAllWorkouts);
    loadPlannerStatus();

    const todayStr = toDateStr(new Date());

    calendarGrid.innerHTML = days.map(day => {

        const dateStr = toDateStr(day);

        const dayWorkouts = weekWorkouts.filter(
            workout => workout.date === dateStr
        );

        const isToday = dateStr === todayStr;

        return `
            <div class="calendar-day ${isToday ? "is-today" : ""}">

                <div class="calendar-day-header">
                    <span class="calendar-day-name">
                        ${day.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span class="calendar-day-number">
                        ${day.getDate()}
                    </span>
                </div>

                <div class="calendar-day-body">
                    ${dayWorkouts.map(createCalendarChip).join("")}
                    <button class="calendar-add-button" data-date="${dateStr}">+ Add</button>
                </div>

            </div>
        `;

    }).join("");

    calendarGrid
        .querySelectorAll(".calendar-add-button")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => openWorkoutModal(button.dataset.date)
            );
        });

    attachDeleteHandlers(calendarGrid);
    attachCompleteHandlers(calendarGrid);
}


function renderWeekSummary(weekWorkouts) {

    const sumBy = (items, key) =>
        items.reduce((total, item) => total + (item[key] || 0), 0);

    const bySport = sport =>
        weekWorkouts.filter(workout => workout.sport === sport);

    const swimKm = sumBy(bySport("swim"), "distance");
    const bikeKm = sumBy(bySport("bike"), "distance");
    const runKm = sumBy(bySport("run"), "distance");
    const gymWorkouts = bySport("gym");

    const totalSeconds = sumBy(weekWorkouts, "duration");

    summaryEls.swim.textContent = `${swimKm.toFixed(1)} km`;
    summaryEls.bike.textContent = `${bikeKm.toFixed(1)} km`;
    summaryEls.run.textContent = `${runKm.toFixed(1)} km`;

    summaryEls.gym.textContent =
        `${gymWorkouts.length} ${gymWorkouts.length === 1 ? "session" : "sessions"}`;

    summaryEls.time.textContent = formatHoursMinutes(totalSeconds);
    summaryEls.count.textContent = `${weekWorkouts.length}`;
}


function renderAllTimeSummary(workouts) {

    const sumBy = (items, key) =>
        items.reduce((total, item) => total + (item[key] || 0), 0);

    const totalDistance = sumBy(workouts, "distance");
    const totalSeconds = sumBy(workouts, "duration");

    allTimeEls.distance.textContent = `${totalDistance.toFixed(1)} km`;
    allTimeEls.time.textContent = formatHoursMinutes(totalSeconds);
    allTimeEls.count.textContent = `${workouts.length}`;
}


// ==================================================
// PLANNER PANEL
// ==================================================

const PHASE_LABELS = {
    recovery: "Recovery",
    base: "Base",
    build: "Build",
    peak: "Peak"
};

const PHASE_DESCRIPTIONS = {
    recovery: "Lighter week — reducing volume and fatigue.",
    base: "Building aerobic volume with steady, easy training.",
    build: "Increasing training load and introducing more quality sessions.",
    peak: "Race-specific work — manually selected, not auto-detected."
};

let plannerStatusLoaded = false;

async function loadPlannerStatus() {

    const token =
        localStorage.getItem("herakon_token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/planner/status`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load training phase.");
        }

        plannerPhaseLabel.textContent = PHASE_LABELS[data.phase] || data.phase;
        plannerPhaseDescription.textContent = PHASE_DESCRIPTIONS[data.phase] || "";

        plannerStatusLoaded = true;

    } catch (error) {

        if (!plannerStatusLoaded) {
            plannerPhaseLabel.textContent = "Phase unavailable";
            plannerPhaseDescription.textContent = error.message;
        }

    }

}


function showPlannerMessage(message) {

    plannerPanelMessage.textContent = message;
    plannerPanelMessage.classList.remove("hidden");
}


function hidePlannerMessage() {

    plannerPanelMessage.classList.add("hidden");
    plannerPanelMessage.textContent = "";
}


async function runPlannerAction(url, successMessageFn) {

    const token =
        localStorage.getItem("herakon_token");

    hidePlannerMessage();

    generateNextWeekButton.disabled = true;
    replanWeekButton.disabled = true;

    const phaseOverride = plannerPhaseOverride.value || null;

    try {

        const response = await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ phase_override: phaseOverride })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to update the plan.");
        }

        showPlannerMessage(successMessageFn(data));

        await loadWorkouts();
        await loadPlannerStatus();

    } catch (error) {

        showPlannerMessage(error.message);

    } finally {

        generateNextWeekButton.disabled = false;
        replanWeekButton.disabled = false;

    }

}


generateNextWeekButton.addEventListener("click", () => {
    runPlannerAction(
        `${API_URL}/planner/generate-next-week`,
        data => `Generated a ${PHASE_LABELS[data.phase] || data.phase} week for ${formatShort(new Date(`${data.week_start}T00:00:00`))} – ${formatShort(new Date(`${data.week_end}T00:00:00`))} (${data.workouts.length} sessions).`
    );
});

replanWeekButton.addEventListener("click", () => {
    runPlannerAction(
        `${API_URL}/planner/replan-remaining-week`,
        data => `Replanned the rest of this week (${data.workouts.length} remaining sessions).`
    );
});


function createCalendarChip(workout) {

    const icon = SPORT_ICONS[workout.sport] || "🏋️";

    const metaParts = buildMetaParts(workout);
    const meta = metaParts.length ? metaParts[0] : "";

    const isPlanned = workout.status === "planned";

    return `
        <div class="calendar-workout-chip sport-${workout.sport} ${isPlanned ? "status-planned" : ""}">

            <div class="chip-main">

                <span class="chip-icon">${icon}</span>

                <div class="chip-text">
                    <span class="chip-title">
                        ${formatWorkoutType(workout.workout_type)} ${capitalize(workout.sport)}
                    </span>
                    ${meta ? `<span class="chip-meta">${meta}</span>` : ""}
                    ${isPlanned ? `<span class="chip-status-tag">Planned</span>` : ""}
                </div>

            </div>

            <div class="chip-actions">

                ${
                    isPlanned
                        ? `
                            <button class="complete-workout" data-id="${workout.id}" title="Mark as completed">
                                &check;
                            </button>
                        `
                        : ""
                }

                <button class="delete-workout" data-id="${workout.id}" title="Delete workout">
                    &times;
                </button>

            </div>

        </div>
    `;

}


// ==================================================
// PROJECTIONS PAGE
// ==================================================

function renderProjections() {

    projectionsGrid.innerHTML = PROJECTION_DATA.map(race => `
        <div class="projection-card">

            <div class="projection-header">
                <h3>${race.name}</h3>
                <p class="projection-distance">${race.distanceLabel}</p>
            </div>

            <div class="projection-total">
                <span class="projection-total-time">${race.total}</span>
                <span class="projection-total-label">Predicted finish</span>
            </div>

            <div class="projection-splits">
                ${race.splits.map(split => `
                    <div class="split-row">
                        <span class="split-label">${split.label}</span>
                        <span class="split-value">${split.value}</span>
                    </div>
                `).join("")}
            </div>

        </div>
    `).join("");

}


// ==================================================
// DYNAMIC WORKOUT-TYPE + FIELD VISIBILITY
// ==================================================

function populateWorkoutTypeOptions(sport) {

    const options =
        sport === "gym" ? GYM_TYPES : ENDURANCE_TYPES;

    const placeholder =
        sport === "gym" ? "Select muscle group" : "Select type";

    typeSelect.innerHTML =
        `<option value="">${placeholder}</option>` +
        options.map(
            option =>
                `<option value="${option.value}">${option.label}</option>`
        ).join("");
}


function isIntervalWorkout() {
    return (
        sportSelect.value !== "gym" &&
        typeSelect.value === "interval"
    );
}


function isGymWorkout() {
    return sportSelect.value === "gym";
}


function updateFieldVisibility() {

    const gym = isGymWorkout();
    const interval = isIntervalWorkout();

    distanceFieldGroup.classList.toggle("hidden", gym || interval);
    setsRepsFieldGroup.classList.toggle("hidden", !gym);
    structuredSetsFieldGroup.classList.toggle("hidden", !interval);
    durationFieldGroup.classList.toggle("hidden", interval);

    if (interval && structuredSets.length === 0) {
        addStructuredSetRow();
    }
}


sportSelect.addEventListener("change", () => {
    populateWorkoutTypeOptions(sportSelect.value);
    updateFieldVisibility();
});

typeSelect.addEventListener(
    "change",
    updateFieldVisibility
);


// ==================================================
// STRUCTURED SET BUILDER
// ==================================================
//
// Each row: { id, distance (km), duration (minutes per rep),
//             pace (free text), reps, restSeconds }
//
// Pace time estimation only understands common "M:SS/unit" formats
// (e.g. "4:25/km", "2:00/100m"). Anything else is just a label — no
// time is guessed from it. See planner.py's module docstring for the
// same principle applied on the backend planning side.

function addStructuredSetRow() {

    structuredSetIdCounter += 1;

    structuredSets.push({
        id: structuredSetIdCounter,
        distance: "",
        duration: "",
        pace: "",
        reps: "1",
        restSeconds: ""
    });

    renderStructuredSetsList();
}


function removeStructuredSetRow(id) {

    structuredSets = structuredSets.filter(set => set.id !== id);

    if (structuredSets.length === 0) {
        addStructuredSetRow();
        return;
    }

    renderStructuredSetsList();
}


function updateStructuredSetField(id, field, value) {

    const set = structuredSets.find(s => s.id === id);

    if (set) {
        set[field] = value;
    }

    updateStructuredSetsSummary();
}


function renderStructuredSetsList() {

    structuredSetsList.innerHTML = structuredSets.map((set, index) => `
        <div class="structured-set-row" data-set-id="${set.id}">

            <div class="structured-set-row-header">
                <span>Set ${index + 1}</span>
                <button type="button" class="remove-set-button" data-remove-id="${set.id}">
                    &times;
                </button>
            </div>

            <div class="structured-set-grid">

                <label>
                    Distance (km)
                    <input type="number" step="0.01" min="0" placeholder="e.g. 1.0"
                        data-set-id="${set.id}" data-field="distance" value="${set.distance}">
                </label>

                <label>
                    Duration per rep (min)
                    <input type="number" step="0.1" min="0" placeholder="e.g. 5"
                        data-set-id="${set.id}" data-field="duration" value="${set.duration}">
                </label>

                <label>
                    Pace / intensity
                    <input type="text" placeholder="e.g. 4:25/km"
                        data-set-id="${set.id}" data-field="pace" value="${set.pace}">
                </label>

                <label>
                    Reps
                    <input type="number" step="1" min="1" placeholder="e.g. 4"
                        data-set-id="${set.id}" data-field="reps" value="${set.reps}">
                </label>

                <label>
                    Rest between reps (sec)
                    <input type="number" step="1" min="0" placeholder="e.g. 90"
                        data-set-id="${set.id}" data-field="restSeconds" value="${set.restSeconds}">
                </label>

            </div>

        </div>
    `).join("");

    structuredSetsList
        .querySelectorAll("input")
        .forEach(input => {
            input.addEventListener("input", () => {
                updateStructuredSetField(
                    Number(input.dataset.setId),
                    input.dataset.field,
                    input.value
                );
            });
        });

    structuredSetsList
        .querySelectorAll(".remove-set-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                removeStructuredSetRow(Number(button.dataset.removeId));
            });
        });

    updateStructuredSetsSummary();
}


addStructuredSetButton.addEventListener(
    "click",
    addStructuredSetRow
);


// Parses "M:SS/unit" pace strings into seconds-per-km. Returns null
// for anything else (e.g. "threshold", "zone 2") rather than
// guessing — see module note above.
function parsePaceSecondsPerKm(pace) {

    if (!pace) {
        return null;
    }

    const match = pace.trim().match(
        /^(\d{1,2}):(\d{2})\s*\/\s*(km|mi|100m|50m|25m|500m)?$/i
    );

    if (!match) {
        return null;
    }

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const unit = (match[3] || "km").toLowerCase();

    const paceSeconds = minutes * 60 + seconds;

    const unitKm = {
        "km": 1,
        "mi": 1.60934,
        "100m": 0.1,
        "50m": 0.05,
        "25m": 0.025,
        "500m": 0.5
    }[unit];

    return paceSeconds / unitKm;
}


// Computes { distanceKm, workSeconds, restSeconds } for one set row.
function computeSetTotals(set) {

    const distancePerRep = Number(set.distance) || 0;
    const manualDurationPerRep = Number(set.duration) || 0;
    const reps = Math.max(Number(set.reps) || 1, 1);
    const restPerGap = Number(set.restSeconds) || 0;

    let perRepSeconds = 0;

    if (manualDurationPerRep > 0) {
        perRepSeconds = manualDurationPerRep * 60;
    } else if (distancePerRep > 0) {
        const secondsPerKm = parsePaceSecondsPerKm(set.pace);
        if (secondsPerKm !== null) {
            perRepSeconds = secondsPerKm * distancePerRep;
        }
    }

    const setDistance = distancePerRep * reps;
    const setWorkSeconds = perRepSeconds * reps;
    const setRestSeconds = restPerGap * Math.max(reps - 1, 0);

    return {
        distanceKm: setDistance,
        workSeconds: setWorkSeconds,
        restSeconds: setRestSeconds
    };
}


function computeStructuredSetsTotals() {

    return structuredSets.reduce((totals, set) => {
        const setTotals = computeSetTotals(set);
        return {
            distanceKm: totals.distanceKm + setTotals.distanceKm,
            workSeconds: totals.workSeconds + setTotals.workSeconds,
            restSeconds: totals.restSeconds + setTotals.restSeconds
        };
    }, { distanceKm: 0, workSeconds: 0, restSeconds: 0 });
}


function updateStructuredSetsSummary() {

    const totals = computeStructuredSetsTotals();

    structuredSummaryEls.distance.textContent =
        totals.distanceKm > 0 ? `${totals.distanceKm.toFixed(2)} km` : "—";

    structuredSummaryEls.work.textContent =
        totals.workSeconds > 0 ? formatHoursMinutes(totals.workSeconds) : "—";

    structuredSummaryEls.rest.textContent =
        totals.restSeconds > 0 ? formatHoursMinutes(totals.restSeconds) : "—";

    const totalSeconds = totals.workSeconds + totals.restSeconds;

    structuredSummaryEls.total.textContent =
        totalSeconds > 0 ? formatHoursMinutes(totalSeconds) : "—";
}


// ==================================================
// WORKOUT MODAL
// ==================================================

function openWorkoutModal(defaultDateStr) {

    editingWorkoutId = null;

    workoutForm.reset();

    workoutFormError.classList.add("hidden");
    workoutFormError.textContent = "";

    workoutModalTitle.textContent = "Add workout";
    workoutFormSubmitButton.textContent = "Save workout";

    structuredSets = [];
    structuredSetIdCounter = 0;

    populateWorkoutTypeOptions("");
    updateFieldVisibility();

    document.getElementById("workout-date").value =
        defaultDateStr || toDateStr(new Date());

    workoutModalOverlay.classList.remove("hidden");
}


// Opens the modal pre-filled with a planned workout's values, so the
// person can adjust them to what actually happened and mark it done.
function openCompleteWorkoutModal(workout) {

    editingWorkoutId = workout.id;

    workoutForm.reset();

    workoutFormError.classList.add("hidden");
    workoutFormError.textContent = "";

    workoutModalTitle.textContent = "Complete workout";
    workoutFormSubmitButton.textContent = "Mark as completed";

    structuredSets = [];
    structuredSetIdCounter = 0;

    sportSelect.value = workout.sport;
    populateWorkoutTypeOptions(workout.sport);
    typeSelect.value = workout.workout_type;

    document.getElementById("workout-date").value = workout.date;
    document.getElementById("workout-distance").value = workout.distance ?? "";
    document.getElementById("workout-duration").value =
        workout.duration ? Math.round(workout.duration / 60) : "";
    document.getElementById("workout-sets").value = workout.sets ?? "";
    document.getElementById("workout-reps").value = workout.reps ?? "";

    const isPlannedInterval =
        workout.sport !== "gym" &&
        workout.workout_type === "interval" &&
        !workout.structured_sets;

    const plannedTargetHint =
        isPlannedInterval && (workout.distance || workout.duration)
            ? `Planned target: ${workout.distance ? `${workout.distance} km` : ""}${workout.distance && workout.duration ? " / " : ""}${workout.duration ? formatDuration(workout.duration) : ""}. Enter what you actually did below.`
            : "";

    document.getElementById("workout-notes").value =
        [plannedTargetHint, workout.notes || ""].filter(Boolean).join(" ");

    updateFieldVisibility();

    workoutModalOverlay.classList.remove("hidden");
}


function closeWorkoutModal() {

    editingWorkoutId = null;

    workoutForm.reset();

    workoutModalOverlay.classList.add("hidden");
}


closeWorkoutModalButton.addEventListener(
    "click",
    closeWorkoutModal
);


cancelWorkoutButton.addEventListener(
    "click",
    closeWorkoutModal
);


workoutModalOverlay.addEventListener(
    "click",
    (event) => {
        if (event.target === workoutModalOverlay) {
            closeWorkoutModal();
        }
    }
);


// ==================================================
// SAVE WORKOUT (add new, or complete a planned one)
// ==================================================

workoutForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const token =
            localStorage.getItem(
                "herakon_token"
            );


        const sport =
            sportSelect.value;

        const workoutType =
            typeSelect.value;

        const date =
            document.getElementById(
                "workout-date"
            ).value;

        const gym = isGymWorkout();
        const interval = isIntervalWorkout();

        const distanceValue =
            document.getElementById(
                "workout-distance"
            ).value;

        const setsValue =
            document.getElementById(
                "workout-sets"
            ).value;

        const repsValue =
            document.getElementById(
                "workout-reps"
            ).value;

        const durationValue =
            document.getElementById(
                "workout-duration"
            ).value;

        const notes =
            document.getElementById(
                "workout-notes"
            ).value;


        let distance = null;
        let duration = null;
        let sets = null;
        let reps = null;
        let structuredSetsPayload = null;

        if (gym) {

            sets = setsValue ? Number(setsValue) : null;
            reps = repsValue ? Number(repsValue) : null;
            duration = durationValue ? Number(durationValue) * 60 : null;

        } else if (interval) {

            const totals = computeStructuredSetsTotals();

            distance = totals.distanceKm > 0 ? Number(totals.distanceKm.toFixed(2)) : null;
            duration = (totals.workSeconds + totals.restSeconds) > 0
                ? Math.round(totals.workSeconds + totals.restSeconds)
                : null;

            structuredSetsPayload = structuredSets.map(set => ({
                distance: set.distance ? Number(set.distance) : null,
                duration: set.duration ? Number(set.duration) * 60 : null,
                pace: set.pace || null,
                reps: set.reps ? Number(set.reps) : 1,
                rest_seconds: set.restSeconds ? Number(set.restSeconds) : null
            }));

        } else {

            distance = distanceValue ? Number(distanceValue) : null;
            duration = durationValue ? Number(durationValue) * 60 : null;

        }


        const workout = {
            sport,
            workout_type: workoutType,
            date,
            distance,
            duration,
            sets,
            reps,
            structured_sets: structuredSetsPayload,
            notes
        };

        if (editingWorkoutId) {
            workout.status = "completed";
        }


        try {

            const url = editingWorkoutId
                ? `${API_URL}/workouts/${editingWorkoutId}`
                : `${API_URL}/workouts`;

            const method = editingWorkoutId ? "PATCH" : "POST";

            const response = await fetch(
                url,
                {

                    method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(workout)

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to save workout."
                );

            }


            closeWorkoutModal();

            await loadWorkouts();


        } catch (error) {

            workoutFormError.textContent = error.message;
            workoutFormError.classList.remove("hidden");

        }

    }
);


// ==================================================
// DELETE WORKOUT
// ==================================================

function attachDeleteHandlers(container) {

    container
        .querySelectorAll(".delete-workout")
        .forEach(button => {

            button.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                    deleteWorkout(button.dataset.id);
                }
            );

        });

}


function attachCompleteHandlers(container) {

    container
        .querySelectorAll(".complete-workout")
        .forEach(button => {

            button.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();

                    const workout = allWorkouts.find(
                        w => w.id === button.dataset.id
                    );

                    if (workout) {
                        openCompleteWorkoutModal(workout);
                    }
                }
            );

        });

}


async function deleteWorkout(workoutId) {

    const confirmed =
        confirm(
            "Delete this workout?"
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem(
            "herakon_token"
        );


    try {

        const response = await fetch(

            `${API_URL}/workouts/${workoutId}`,

            {

                method: "DELETE",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to delete workout."
            );

        }


        await loadWorkouts();


    } catch (error) {

        alert(error.message);

    }

}


// ==================================================
// WORKOUT CARD (Today page)
// ==================================================

function createWorkoutHTML(workout) {

    const icon =
        SPORT_ICONS[workout.sport] || "🏋️";

    const metaParts = buildMetaParts(workout);

    const isPlanned = workout.status === "planned";


    return `

        <div class="workout-card ${isPlanned ? "status-planned" : ""}">

            <div class="workout-main">

                <div class="workout-icon">
                    ${icon}
                </div>


                <div>

                    <h3>
                        ${formatWorkoutType(
                            workout.workout_type
                        )}
                        ${capitalize(
                            workout.sport
                        )}
                        ${isPlanned ? `<span class="chip-status-tag">Planned</span>` : ""}
                    </h3>

                    <p class="workout-date">
                        ${formatDate(
                            workout.date
                        )}
                    </p>


                    <div class="workout-stats">

                        ${metaParts.map(
                            part => `<span>${part}</span>`
                        ).join("")}

                    </div>


                    ${
                        workout.notes
                            ? `
                                <p class="workout-notes">
                                    ${workout.notes}
                                </p>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="chip-actions">

                ${
                    isPlanned
                        ? `
                            <button
                                class="complete-workout"
                                data-id="${workout.id}"
                                title="Mark as completed"
                            >
                                &check; Complete
                            </button>
                        `
                        : ""
                }

                <button
                    class="delete-workout"
                    data-id="${workout.id}"
                >
                    Delete
                </button>

            </div>

        </div>

    `;

}


// ==================================================
// DATE / TIME HELPERS
// ==================================================

function toDateStr(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getMonday(date) {

    const result = new Date(date);

    const day = result.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + diff);

    result.setHours(0, 0, 0, 0);

    return result;
}


function addDays(date, days) {

    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
}


function getWeekDays(monday) {

    return Array.from(
        { length: 7 },
        (_, index) => addDays(monday, index)
    );
}


function formatShort(date) {

    return date.toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short" }
    );
}


function formatHoursMinutes(totalSeconds) {

    const totalMinutes = Math.round(totalSeconds / 60);

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}


function formatDuration(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;


    if (hours > 0) {

        return `${hours}h ${remainingMinutes}m`;

    }


    return `${minutes} min`;

}


function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            weekday: "short",
            day: "numeric",
            month: "short"
        }
    );

}


function buildMetaParts(workout) {

    const parts = [];

    if (workout.distance) {
        parts.push(`${workout.distance} km`);
    }

    if (workout.sets || workout.reps) {

        const setsLabel =
            workout.sets ? `${workout.sets} sets` : "";

        const repsLabel =
            workout.reps ? `${workout.reps} reps` : "";

        parts.push(
            [setsLabel, repsLabel]
                .filter(Boolean)
                .join(" \u00d7 ")
        );
    }

    if (workout.pace) {
        parts.push(`Pace ${workout.pace}`);
    }

    if (workout.duration) {
        parts.push(formatDuration(workout.duration));
    }

    return parts;
}


function formatWorkoutType(type) {

    if (!type) {
        return "";
    }

    return type
        .split("_")
        .map(capitalize)
        .join(" ");
}


function capitalize(string) {

    if (!string) {
        return "";
    }

    return (
        string.charAt(0).toUpperCase() +
        string.slice(1)
    );

}
