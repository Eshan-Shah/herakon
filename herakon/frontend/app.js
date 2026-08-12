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
    { value: "long", label: "Long" },
    { value: "tempo", label: "Tempo / Threshold" },
    { value: "interval", label: "Interval" },
    { value: "technique", label: "Technique" },
    { value: "brick", label: "Brick" },
    { value: "race_pace", label: "Race Pace" },
    { value: "test", label: "Test / Benchmark" },
    { value: "other", label: "Other" }
];

const GYM_TYPES = [
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "shoulders", label: "Shoulders" },
    { value: "biceps", label: "Biceps" },
    { value: "triceps", label: "Triceps" },
    { value: "legs", label: "Legs" },
    { value: "glutes", label: "Glutes" },
    { value: "core", label: "Core" },
    { value: "full_body", label: "Full Body" }
];

const SECTION_NAME_OPTIONS = [
    "Warm-up", "Technique", "Main", "Finisher", "Cool-down", "Recovery", "Custom"
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

const durationFieldGroup =
    document.getElementById("duration-field-group");

const entryModeToggle =
    document.getElementById("entry-mode-toggle");

const entryModeButtons =
    document.querySelectorAll(".entry-mode-button");

const sectionsFieldGroup =
    document.getElementById("sections-field-group");

const sectionsList =
    document.getElementById("sections-list");

const addSectionButton =
    document.getElementById("add-section-button");

const sectionsSummaryEls = {
    distance: document.getElementById("sections-summary-distance"),
    work: document.getElementById("sections-summary-work"),
    rest: document.getElementById("sections-summary-rest"),
    total: document.getElementById("sections-summary-total")
};

const exercisesFieldGroup =
    document.getElementById("exercises-field-group");

const exercisesList =
    document.getElementById("exercises-list");

const addExerciseButton =
    document.getElementById("add-exercise-button");

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
// ELEMENTS — WORKOUT DETAIL MODAL
// ==================================================

const detailModalOverlay =
    document.getElementById("detail-modal-overlay");

const detailModalTitle =
    document.getElementById("detail-modal-title");

const detailModalBody =
    document.getElementById("detail-modal-body");

const closeDetailModalButton =
    document.getElementById("close-detail-modal");

const detailEditButton =
    document.getElementById("detail-edit-button");

const detailCompleteButton =
    document.getElementById("detail-complete-button");

const detailDeleteButton =
    document.getElementById("detail-delete-button");


// ==================================================
// STATE
// ==================================================

let allWorkouts = null;
let loadError = null;
let currentPage = "today";
let weekStart = getMonday(new Date());
let editingWorkoutId = null;   // set when completing/editing an existing workout
let editingForceComplete = false;  // true only for the "complete a planned workout" flow
let entryMode = "quick";       // "quick" | "structured" — swim/bike/run only
let sections = [];             // structured-workout builder: [{id, name, customName, sets:[...]}]
let sectionIdCounter = 0;
let setIdCounter = 0;
let exercises = [];            // gym builder: [{id, muscleGroup, exercise, sets, reps, weight, notes}]
let exerciseIdCounter = 0;
let exerciseLibrary = null;    // fetched once from /gym/exercise-library
let detailModalWorkout = null; // workout currently shown in the detail modal


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
        attachDetailClickHandlers(todayContent);

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
    attachDetailClickHandlers(todayPlannedContent);
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
    attachDetailClickHandlers(calendarGrid);
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
        <div class="calendar-workout-chip sport-${workout.sport} ${isPlanned ? "status-planned" : ""}" data-open-detail="${workout.id}">

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


function isGymWorkout() {
    return sportSelect.value === "gym";
}


function updateFieldVisibility() {

    const gym = isGymWorkout();
    const structured = !gym && entryMode === "structured";

    entryModeToggle.classList.toggle("hidden", gym);
    distanceFieldGroup.classList.toggle("hidden", gym || structured);
    durationFieldGroup.classList.toggle("hidden", structured);
    sectionsFieldGroup.classList.toggle("hidden", !structured);
    exercisesFieldGroup.classList.toggle("hidden", !gym);

    if (structured && sections.length === 0) {
        addSection();
    }

    if (gym && exercises.length === 0) {
        addExercise();
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


entryModeButtons.forEach(button => {
    button.addEventListener("click", () => {
        entryMode = button.dataset.mode;
        entryModeButtons.forEach(b => b.classList.toggle("active", b === button));
        updateFieldVisibility();
    });
});


// ==================================================
// GYM EXERCISE LIBRARY (fetched once, cached)
// ==================================================

async function loadExerciseLibrary() {

    if (exerciseLibrary) {
        return exerciseLibrary;
    }

    const token = localStorage.getItem("herakon_token");

    try {

        const response = await fetch(
            `${API_URL}/gym/exercise-library`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load exercise library.");
        }

        exerciseLibrary = data;
        return exerciseLibrary;

    } catch (error) {

        // Minimal fallback so the exercise builder still works if the
        // library fetch fails for some reason.
        exerciseLibrary = {
            muscle_groups: ["full_body"],
            exercises_by_muscle_group: { full_body: ["Bodyweight exercise"] },
            swim_strokes: ["FC", "Breast", "Back", "Fly", "IM", "Kick", "Drill"]
        };
        return exerciseLibrary;

    }

}


// ==================================================
// STRUCTURED WORKOUT BUILDER (sections + sets)
// ==================================================
//
// Each section: { id, name, customName, sets: [...] }
// Each set: { id, distance, duration, pace, stroke, reps, restSeconds, notes }
//
// Swim set distances are entered in METRES (matching how pool
// sessions are actually described); bike/run set distances are in
// km, matching the rest of the app. Pace time estimation only
// understands common "M:SS/unit" formats — anything else (e.g.
// "threshold") is just a label, same principle as planner.py.

function addSection() {

    sectionIdCounter += 1;

    const section = {
        id: sectionIdCounter,
        name: sections.length === 0 ? "Warm-up" : "Main",
        customName: "",
        sets: []
    };

    sections.push(section);

    addSetToSection(section.id, true);

    renderSections();
}


function removeSection(id) {

    sections = sections.filter(s => s.id !== id);

    if (sections.length === 0) {
        addSection();
        return;
    }

    renderSections();
}


function addSetToSection(sectionId, skipRender) {

    setIdCounter += 1;

    const section = sections.find(s => s.id === sectionId);

    if (!section) {
        return;
    }

    section.sets.push({
        id: setIdCounter,
        distance: "",
        duration: "",
        pace: "",
        stroke: "FC",
        reps: "1",
        restSeconds: "",
        notes: ""
    });

    if (!skipRender) {
        renderSections();
    }
}


function removeSetFromSection(sectionId, setId) {

    const section = sections.find(s => s.id === sectionId);

    if (!section) {
        return;
    }

    section.sets = section.sets.filter(s => s.id !== setId);

    if (section.sets.length === 0) {
        addSetToSection(sectionId, true);
    }

    renderSections();
}


function updateSectionName(sectionId, name, customName) {

    const section = sections.find(s => s.id === sectionId);

    if (section) {
        section.name = name;
        if (customName !== undefined) {
            section.customName = customName;
        }
    }

    renderSections();
}


function updateSetField(sectionId, setId, field, value) {

    const section = sections.find(s => s.id === sectionId);
    const set = section && section.sets.find(s => s.id === setId);

    if (set) {
        set[field] = value;
    }

    updateSectionsSummary();
}


function renderSections() {

    const sport = sportSelect.value;
    const isSwim = sport === "swim";

    sectionsList.innerHTML = sections.map(section => `
        <div class="section-block" data-section-id="${section.id}">

            <div class="section-block-header">

                <select class="section-name-select" data-section-id="${section.id}">
                    ${SECTION_NAME_OPTIONS.map(name => `
                        <option value="${name}" ${section.name === name ? "selected" : ""}>${name}</option>
                    `).join("")}
                </select>

                ${section.name === "Custom" ? `
                    <input type="text" class="section-custom-name" placeholder="Section name"
                        data-section-id="${section.id}" value="${section.customName}">
                ` : ""}

                <button type="button" class="remove-section-button" data-remove-section-id="${section.id}">
                    &times;
                </button>

            </div>

            <div class="section-sets-list">
                ${section.sets.map((set, index) => `
                    <div class="structured-set-row" data-set-id="${set.id}">

                        <div class="structured-set-row-header">
                            <span>Set ${index + 1}</span>
                            <button type="button" class="remove-set-button"
                                data-section-id="${section.id}" data-remove-id="${set.id}">
                                &times;
                            </button>
                        </div>

                        <div class="structured-set-grid">

                            <label>
                                Distance (${isSwim ? "m" : "km"})
                                <input type="number" step="${isSwim ? "1" : "0.01"}" min="0"
                                    placeholder="${isSwim ? "e.g. 200" : "e.g. 1.0"}"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="distance" value="${set.distance}">
                            </label>

                            <label>
                                Duration per rep (min)
                                <input type="number" step="0.1" min="0" placeholder="e.g. 5"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="duration" value="${set.duration}">
                            </label>

                            <label>
                                Pace / intensity
                                <input type="text" placeholder="${isSwim ? "e.g. 1:55/100m" : "e.g. 4:25/km"}"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="pace" value="${set.pace}">
                            </label>

                            ${isSwim ? `
                                <label>
                                    Stroke
                                    <select data-section-id="${section.id}" data-set-id="${set.id}" data-field="stroke">
                                        ${SWIM_STROKES.map(stroke => `
                                            <option value="${stroke}" ${set.stroke === stroke ? "selected" : ""}>${stroke}</option>
                                        `).join("")}
                                    </select>
                                </label>
                            ` : ""}

                            <label>
                                Reps
                                <input type="number" step="1" min="1" placeholder="e.g. 4"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="reps" value="${set.reps}">
                            </label>

                            <label>
                                Rest between reps (sec)
                                <input type="number" step="1" min="0" placeholder="e.g. 90"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="restSeconds" value="${set.restSeconds}">
                            </label>

                            <label>
                                Notes
                                <input type="text" placeholder="e.g. long strokes"
                                    data-section-id="${section.id}" data-set-id="${set.id}"
                                    data-field="notes" value="${set.notes}">
                            </label>

                        </div>

                    </div>
                `).join("")}
            </div>

            <button type="button" class="text-button add-set-to-section-button" data-section-id="${section.id}">
                + Add Set
            </button>

        </div>
    `).join("");

    sectionsList
        .querySelectorAll(".section-name-select")
        .forEach(select => {
            select.addEventListener("change", () => {
                updateSectionName(Number(select.dataset.sectionId), select.value);
            });
        });

    sectionsList
        .querySelectorAll(".section-custom-name")
        .forEach(input => {
            input.addEventListener("input", () => {
                updateSectionName(Number(input.dataset.sectionId), "Custom", input.value);
            });
        });

    sectionsList
        .querySelectorAll(".remove-section-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                removeSection(Number(button.dataset.removeSectionId));
            });
        });

    sectionsList
        .querySelectorAll(".add-set-to-section-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                addSetToSection(Number(button.dataset.sectionId));
            });
        });

    sectionsList
        .querySelectorAll(".remove-set-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                removeSetFromSection(Number(button.dataset.sectionId), Number(button.dataset.removeId));
            });
        });

    sectionsList
        .querySelectorAll(".structured-set-grid input, .structured-set-grid select")
        .forEach(input => {
            const eventName = input.tagName === "SELECT" ? "change" : "input";
            input.addEventListener(eventName, () => {
                updateSetField(
                    Number(input.dataset.sectionId),
                    Number(input.dataset.setId),
                    input.dataset.field,
                    input.value
                );
            });
        });

    updateSectionsSummary();
}


addSectionButton.addEventListener("click", addSection);


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
// `sport` matters because swim set distances are entered in metres.
function computeSetTotals(set, sport) {

    const rawDistance = Number(set.distance) || 0;
    const distancePerRepKm = sport === "swim" ? rawDistance / 1000 : rawDistance;
    const manualDurationPerRep = Number(set.duration) || 0;
    const reps = Math.max(Number(set.reps) || 1, 1);
    const restPerGap = Number(set.restSeconds) || 0;

    let perRepSeconds = 0;

    if (manualDurationPerRep > 0) {
        perRepSeconds = manualDurationPerRep * 60;
    } else if (distancePerRepKm > 0) {
        const secondsPerKm = parsePaceSecondsPerKm(set.pace);
        if (secondsPerKm !== null) {
            perRepSeconds = secondsPerKm * distancePerRepKm;
        }
    }

    const setDistance = distancePerRepKm * reps;
    const setWorkSeconds = perRepSeconds * reps;
    const setRestSeconds = restPerGap * Math.max(reps - 1, 0);

    return {
        distanceKm: setDistance,
        workSeconds: setWorkSeconds,
        restSeconds: setRestSeconds
    };
}


function computeSectionsTotals() {

    const sport = sportSelect.value;

    return sections.reduce((totals, section) => {
        const sectionTotals = section.sets.reduce((sub, set) => {
            const setTotals = computeSetTotals(set, sport);
            return {
                distanceKm: sub.distanceKm + setTotals.distanceKm,
                workSeconds: sub.workSeconds + setTotals.workSeconds,
                restSeconds: sub.restSeconds + setTotals.restSeconds
            };
        }, { distanceKm: 0, workSeconds: 0, restSeconds: 0 });

        return {
            distanceKm: totals.distanceKm + sectionTotals.distanceKm,
            workSeconds: totals.workSeconds + sectionTotals.workSeconds,
            restSeconds: totals.restSeconds + sectionTotals.restSeconds
        };
    }, { distanceKm: 0, workSeconds: 0, restSeconds: 0 });
}


function updateSectionsSummary() {

    const totals = computeSectionsTotals();

    sectionsSummaryEls.distance.textContent =
        totals.distanceKm > 0 ? `${totals.distanceKm.toFixed(2)} km` : "—";

    sectionsSummaryEls.work.textContent =
        totals.workSeconds > 0 ? formatHoursMinutes(totals.workSeconds) : "—";

    sectionsSummaryEls.rest.textContent =
        totals.restSeconds > 0 ? formatHoursMinutes(totals.restSeconds) : "—";

    const totalSeconds = totals.workSeconds + totals.restSeconds;

    sectionsSummaryEls.total.textContent =
        totalSeconds > 0 ? formatHoursMinutes(totalSeconds) : "—";
}


// ==================================================
// GYM EXERCISE BUILDER
// ==================================================

function addExercise() {

    exerciseIdCounter += 1;

    const defaultGroup = (exerciseLibrary && exerciseLibrary.muscle_groups[0]) || "full_body";
    const defaultExercise = (exerciseLibrary &&
        exerciseLibrary.exercises_by_muscle_group[defaultGroup] &&
        exerciseLibrary.exercises_by_muscle_group[defaultGroup][0]) || "";

    exercises.push({
        id: exerciseIdCounter,
        muscleGroup: defaultGroup,
        exercise: defaultExercise,
        sets: "3",
        reps: "10",
        weight: "",
        notes: ""
    });

    renderExercises();
}


function removeExercise(id) {

    exercises = exercises.filter(e => e.id !== id);

    if (exercises.length === 0) {
        addExercise();
        return;
    }

    renderExercises();
}


function updateExerciseField(id, field, value) {

    const exercise = exercises.find(e => e.id === id);

    if (!exercise) {
        return;
    }

    exercise[field] = value;

    if (field === "muscleGroup") {
        const pool = (exerciseLibrary && exerciseLibrary.exercises_by_muscle_group[value]) || [];
        exercise.exercise = pool[0] || "";
        renderExercises();
    }
}


function renderExercises() {

    const groups = (exerciseLibrary && exerciseLibrary.muscle_groups) || ["full_body"];

    exercisesList.innerHTML = exercises.map((exercise, index) => {

        const pool = (exerciseLibrary && exerciseLibrary.exercises_by_muscle_group[exercise.muscleGroup]) || [];

        return `
            <div class="exercise-row" data-exercise-id="${exercise.id}">

                <div class="exercise-row-header">
                    <span>Exercise ${index + 1}</span>
                    <button type="button" class="remove-exercise-button" data-remove-id="${exercise.id}">
                        &times;
                    </button>
                </div>

                <div class="exercise-row-grid">

                    <label>
                        Muscle group
                        <select data-exercise-id="${exercise.id}" data-field="muscleGroup">
                            ${groups.map(group => `
                                <option value="${group}" ${exercise.muscleGroup === group ? "selected" : ""}>
                                    ${formatWorkoutType(group)}
                                </option>
                            `).join("")}
                        </select>
                    </label>

                    <label>
                        Exercise
                        <select data-exercise-id="${exercise.id}" data-field="exercise">
                            ${pool.map(name => `
                                <option value="${name}" ${exercise.exercise === name ? "selected" : ""}>${name}</option>
                            `).join("")}
                        </select>
                    </label>

                    <label>
                        Sets
                        <input type="number" step="1" min="1" value="${exercise.sets}"
                            data-exercise-id="${exercise.id}" data-field="sets">
                    </label>

                    <label>
                        Reps
                        <input type="number" step="1" min="1" value="${exercise.reps}"
                            data-exercise-id="${exercise.id}" data-field="reps">
                    </label>

                    <label>
                        Weight (kg)
                        <input type="number" step="0.5" min="0" placeholder="bodyweight" value="${exercise.weight}"
                            data-exercise-id="${exercise.id}" data-field="weight">
                    </label>

                    <label>
                        Notes
                        <input type="text" placeholder="optional" value="${exercise.notes}"
                            data-exercise-id="${exercise.id}" data-field="notes">
                    </label>

                </div>

            </div>
        `;
    }).join("");

    exercisesList
        .querySelectorAll(".remove-exercise-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                removeExercise(Number(button.dataset.removeId));
            });
        });

    exercisesList
        .querySelectorAll("[data-exercise-id][data-field]")
        .forEach(input => {
            const eventName = input.tagName === "SELECT" ? "change" : "input";
            input.addEventListener(eventName, () => {
                updateExerciseField(
                    Number(input.dataset.exerciseId),
                    input.dataset.field,
                    input.value
                );
            });
        });
}


addExerciseButton.addEventListener("click", addExercise);


// ==================================================
// WORKOUT MODAL
// ==================================================

function resetBuilderState() {

    entryMode = "quick";
    entryModeButtons.forEach(b => b.classList.toggle("active", b.dataset.mode === "quick"));

    sections = [];
    sectionIdCounter = 0;
    setIdCounter = 0;

    exercises = [];
    exerciseIdCounter = 0;
}


function sectionsFromWorkout(workout) {

    return (workout.sections || []).map(section => {

        sectionIdCounter += 1;

        return {
            id: sectionIdCounter,
            name: SECTION_NAME_OPTIONS.includes(section.name) ? section.name : "Custom",
            customName: SECTION_NAME_OPTIONS.includes(section.name) ? "" : section.name,
            sets: (section.sets || []).map(set => {
                setIdCounter += 1;
                return {
                    id: setIdCounter,
                    distance: set.distance ?? "",
                    duration: set.duration ? Number((set.duration / 60).toFixed(2)) : "",
                    pace: set.pace || "",
                    stroke: set.stroke || "FC",
                    reps: set.reps ?? "1",
                    restSeconds: set.rest_seconds ?? "",
                    notes: set.notes || ""
                };
            })
        };
    });
}


function exercisesFromWorkout(workout) {

    return (workout.exercises || []).map(exercise => {

        exerciseIdCounter += 1;

        return {
            id: exerciseIdCounter,
            muscleGroup: exercise.muscle_group || "full_body",
            exercise: exercise.exercise || "",
            sets: exercise.sets ?? "3",
            reps: exercise.reps ?? "10",
            weight: exercise.weight ?? "",
            notes: exercise.notes || ""
        };
    });
}


async function openWorkoutModal(defaultDateStr) {

    editingWorkoutId = null;
    editingForceComplete = false;

    workoutForm.reset();

    workoutFormError.classList.add("hidden");
    workoutFormError.textContent = "";

    workoutModalTitle.textContent = "Add workout";
    workoutFormSubmitButton.textContent = "Save workout";

    resetBuilderState();

    await loadExerciseLibrary();

    populateWorkoutTypeOptions("");
    updateFieldVisibility();

    document.getElementById("workout-date").value =
        defaultDateStr || toDateStr(new Date());

    workoutModalOverlay.classList.remove("hidden");
}


// Shared pre-fill used by both the "complete a planned workout" flow
// and the general "edit workout" flow — including any generated
// sections/exercises, so nothing is lost when editing.
async function prefillModalFromWorkout(workout, title, submitLabel) {

    editingWorkoutId = workout.id;

    workoutForm.reset();

    workoutFormError.classList.add("hidden");
    workoutFormError.textContent = "";

    workoutModalTitle.textContent = title;
    workoutFormSubmitButton.textContent = submitLabel;

    resetBuilderState();

    await loadExerciseLibrary();

    sportSelect.value = workout.sport;
    populateWorkoutTypeOptions(workout.sport);
    typeSelect.value = workout.workout_type;

    document.getElementById("workout-date").value = workout.date;
    document.getElementById("workout-notes").value = workout.notes || "";

    if (workout.sport === "gym") {

        exercises = exercisesFromWorkout(workout);
        if (exercises.length === 0) {
            addExercise();
        }

    } else if (workout.sections && workout.sections.length > 0) {

        entryMode = "structured";
        entryModeButtons.forEach(b => b.classList.toggle("active", b.dataset.mode === "structured"));
        sections = sectionsFromWorkout(workout);

    } else {

        document.getElementById("workout-distance").value = workout.distance ?? "";
        document.getElementById("workout-duration").value =
            (workout.actual_duration ?? workout.duration)
                ? Math.round((workout.actual_duration ?? workout.duration) / 60)
                : "";

    }

    updateFieldVisibility();

    if (workout.sport === "gym") {
        renderExercises();
    } else if (entryMode === "structured") {
        renderSections();
    }

    workoutModalOverlay.classList.remove("hidden");
}


// Pre-fills the modal with a planned workout's generated sections/
// exercises so the person can adjust them to what actually happened
// and mark the session done.
async function openCompleteWorkoutModal(workout) {

    editingForceComplete = true;

    await prefillModalFromWorkout(workout, "Complete workout", "Mark as completed");
}


// General edit — works on planned or completed workouts, and never
// changes status on its own (see submit handler).
async function openEditWorkoutModal(workout) {

    editingForceComplete = false;

    const title = workout.status === "planned" ? "Edit planned workout" : "Edit workout";

    await prefillModalFromWorkout(workout, title, "Save changes");
}


function closeWorkoutModal() {

    editingWorkoutId = null;
    editingForceComplete = false;

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
// WORKOUT DETAIL MODAL (read-only expanded view)
// ==================================================

// Formats one structured set into a readable line, e.g.
// "5 × 200m FC @ 1:55–2:00/100m", plus an optional rest sub-line.
function formatSetLine(set, sport) {

    const reps = Number(set.reps) || 1;
    const repsPrefix = reps > 1 ? `${reps} \u00d7 ` : "";

    let amount = "";
    if (set.distance) {
        amount = sport === "swim" ? `${set.distance}m` : `${set.distance}km`;
    } else if (set.duration) {
        amount = `${Math.round(set.duration / 60)} min`;
    }

    const strokePart = (sport === "swim" && set.stroke) ? ` ${set.stroke}` : "";
    const pacePart = set.pace ? ` @ ${set.pace}` : "";

    const main = `${repsPrefix}${amount}${strokePart}${pacePart}`.trim() ||
        (set.notes || "Set");

    const subParts = [];
    if (set.rest_seconds) {
        subParts.push(`Rest: ${formatRestSeconds(set.rest_seconds)}`);
    }
    if (set.notes && main !== set.notes) {
        subParts.push(set.notes);
    }

    return { main, sub: subParts.join(" \u00b7 ") };
}


function renderDetailSections(workout) {

    return workout.sections.map(section => `
        <div class="detail-section">
            <h4 class="detail-section-name">${section.name}</h4>
            ${section.sets.map(set => {
                const line = formatSetLine(set, workout.sport);
                return `
                    <p class="detail-set-line">${line.main}</p>
                    ${line.sub ? `<p class="detail-set-subline">${line.sub}</p>` : ""}
                `;
            }).join("")}
        </div>
    `).join("");
}


function renderDetailExercises(workout) {

    return `
        <div class="detail-section">
            <h4 class="detail-section-name">Exercises</h4>
            ${workout.exercises.map(exercise => `
                <div class="detail-exercise">
                    <span class="detail-exercise-name">${exercise.exercise}</span>
                    <span class="detail-exercise-meta">
                        ${exercise.weight ? `${exercise.weight}kg \u00d7 ` : "Bodyweight \u00d7 "}${exercise.reps} \u00d7 ${exercise.sets} sets
                    </span>
                </div>
            `).join("")}
        </div>
    `;
}


function openDetailModal(workout) {

    detailModalWorkout = workout;

    const isPlanned = workout.status === "planned";
    const effectiveDuration = workout.actual_duration ?? workout.duration;
    const hasDistance = workout.sport !== "gym" && workout.distance;

    detailModalTitle.textContent =
        `${formatWorkoutType(workout.workout_type)} ${capitalize(workout.sport)}`;

    const primaryValue = hasDistance
        ? `${workout.distance} km`
        : (effectiveDuration ? formatHoursMinutes(effectiveDuration) : "\u2014");

    const primaryLabel = hasDistance
        ? "Total distance"
        : (workout.actual_duration ? "Actual time" : "Estimated time");

    const secondaryLine = hasDistance && effectiveDuration
        ? `<span class="detail-total-label">${workout.actual_duration ? "Actual" : "Estimated"} time: ${formatHoursMinutes(effectiveDuration)}</span>`
        : "";

    let bodyHTML = `
        <span class="detail-status-tag">${isPlanned ? "Planned" : "Completed"}</span>

        <div class="detail-total">
            <div class="detail-total-value">${primaryValue}</div>
            <span class="detail-total-label">${primaryLabel}</span>
            ${secondaryLine}
        </div>
    `;

    if (workout.sport === "gym" && workout.exercises && workout.exercises.length > 0) {
        bodyHTML += renderDetailExercises(workout);
    } else if (workout.sections && workout.sections.length > 0) {
        bodyHTML += renderDetailSections(workout);
    }

    if (workout.notes) {
        bodyHTML += `<p class="detail-notes">${workout.notes}</p>`;
    }

    detailModalBody.innerHTML = bodyHTML;

    detailCompleteButton.classList.toggle("hidden", !isPlanned);
    detailCompleteButton.dataset.id = workout.id;
    detailEditButton.dataset.id = workout.id;
    detailDeleteButton.dataset.id = workout.id;

    detailModalOverlay.classList.remove("hidden");
}


function closeDetailModal() {

    detailModalWorkout = null;

    detailModalOverlay.classList.add("hidden");
}


closeDetailModalButton.addEventListener("click", closeDetailModal);

detailModalOverlay.addEventListener("click", (event) => {
    if (event.target === detailModalOverlay) {
        closeDetailModal();
    }
});

detailEditButton.addEventListener("click", () => {
    if (detailModalWorkout) {
        closeDetailModal();
        openEditWorkoutModal(detailModalWorkout);
    }
});

detailCompleteButton.addEventListener("click", () => {
    if (detailModalWorkout) {
        closeDetailModal();
        openCompleteWorkoutModal(detailModalWorkout);
    }
});

detailDeleteButton.addEventListener("click", () => {
    if (detailModalWorkout) {
        const id = detailModalWorkout.id;
        closeDetailModal();
        deleteWorkout(id);
    }
});


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
        const structured = !gym && entryMode === "structured";

        const distanceValue =
            document.getElementById(
                "workout-distance"
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
        let sectionsPayload = null;
        let exercisesPayload = null;

        if (gym) {

            exercisesPayload = exercises.map(exercise => ({
                muscle_group: exercise.muscleGroup,
                exercise: exercise.exercise,
                sets: exercise.sets ? Number(exercise.sets) : null,
                reps: exercise.reps ? Number(exercise.reps) : null,
                weight: exercise.weight ? Number(exercise.weight) : null,
                notes: exercise.notes || null
            }));

            duration = durationValue ? Number(durationValue) * 60 : null;

        } else if (structured) {

            const totals = computeSectionsTotals();

            distance = totals.distanceKm > 0 ? Number(totals.distanceKm.toFixed(2)) : null;
            duration = (totals.workSeconds + totals.restSeconds) > 0
                ? Math.round(totals.workSeconds + totals.restSeconds)
                : null;

            sectionsPayload = sections.map(section => ({
                name: section.name === "Custom" ? (section.customName || "Custom") : section.name,
                sets: section.sets.map(set => ({
                    distance: set.distance ? Number(set.distance) : null,
                    duration: set.duration ? Math.round(Number(set.duration) * 60) : null,
                    pace: set.pace || null,
                    stroke: sport === "swim" ? (set.stroke || null) : null,
                    reps: set.reps ? Number(set.reps) : 1,
                    rest_seconds: set.restSeconds ? Number(set.restSeconds) : null,
                    notes: set.notes || null
                }))
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
            sections: sectionsPayload,
            exercises: exercisesPayload,
            sets: null,
            reps: null,
            notes
        };

        if (editingWorkoutId && editingForceComplete) {
            workout.status = "completed";
            workout.actual_duration = duration;
            // Leave the original planned `duration` (the estimate)
            // untouched on the existing record — only PATCH fields
            // that are actually present in the request body get
            // applied, so deleting the key here preserves it.
            delete workout.duration;
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


function attachDetailClickHandlers(container) {

    container
        .querySelectorAll("[data-open-detail]")
        .forEach(el => {

            el.addEventListener("click", () => {

                const workout = allWorkouts.find(
                    w => w.id === el.dataset.openDetail
                );

                if (workout) {
                    openDetailModal(workout);
                }
            });

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

        <div class="workout-card ${isPlanned ? "status-planned" : ""}" data-open-detail="${workout.id}">

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


// Unlike formatHoursMinutes (which rounds to the nearest minute —
// fine for whole-workout totals), rest intervals between reps are
// often under a minute and need second-level precision.
function formatRestSeconds(seconds) {

    const total = Math.round(seconds);

    if (total < 60) {
        return `${total}s`;
    }

    const minutes = Math.floor(total / 60);
    const remainder = total % 60;

    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
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

    if (workout.exercises && workout.exercises.length > 0) {
        parts.push(`${workout.exercises.length} exercise${workout.exercises.length === 1 ? "" : "s"}`);
    }

    const effectiveDuration = workout.actual_duration ?? workout.duration;

    if (effectiveDuration) {
        parts.push(formatDuration(effectiveDuration));
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
