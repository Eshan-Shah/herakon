const API_URL = "http://localhost:8000";

const SPORT_ICONS = {
    swim: "🏊",
    bike: "🚴",
    run: "🏃",
    gym: "🏋️"
};


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


// ==================================================
// STATE
// ==================================================

let allWorkouts = null;
let loadError = null;
let currentPage = "today";
let weekStart = getMonday(new Date());


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

        return;
    }

    const todayStr = toDateStr(new Date());

    const todaysWorkouts = allWorkouts.filter(
        workout => workout.date === todayStr
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

        return;
    }

    todayContent.innerHTML = `
        <div class="workout-list">
            ${todaysWorkouts.map(createWorkoutHTML).join("")}
        </div>
    `;

    attachDeleteHandlers(todayContent);
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

        return;
    }

    const weekWorkouts = allWorkouts.filter(
        workout =>
            workout.date >= weekStartStr &&
            workout.date <= weekEndStr
    );

    renderWeekSummary(weekWorkouts);

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
                    ${
                        dayWorkouts.length === 0
                            ? `<button class="calendar-add-button" data-date="${dateStr}">+ Add</button>`
                            : dayWorkouts.map(createCalendarChip).join("")
                    }
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


function createCalendarChip(workout) {

    const icon = SPORT_ICONS[workout.sport] || "🏋️";

    const meta =
        workout.distance
            ? `${workout.distance} km`
            : (workout.duration ? formatDuration(workout.duration) : "");

    return `
        <div class="calendar-workout-chip sport-${workout.sport}">

            <div class="chip-main">

                <span class="chip-icon">${icon}</span>

                <div class="chip-text">
                    <span class="chip-title">
                        ${capitalize(workout.workout_type)} ${capitalize(workout.sport)}
                    </span>
                    ${meta ? `<span class="chip-meta">${meta}</span>` : ""}
                </div>

            </div>

            <button class="delete-workout" data-id="${workout.id}" title="Delete workout">
                &times;
            </button>

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
// WORKOUT MODAL
// ==================================================

function openWorkoutModal(defaultDateStr) {

    workoutForm.reset();

    workoutFormError.classList.add("hidden");
    workoutFormError.textContent = "";

    document.getElementById("workout-date").value =
        defaultDateStr || toDateStr(new Date());

    workoutModalOverlay.classList.remove("hidden");
}


function closeWorkoutModal() {

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
// ADD WORKOUT
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
            document.getElementById(
                "workout-sport"
            ).value;

        const workoutType =
            document.getElementById(
                "workout-type"
            ).value;

        const date =
            document.getElementById(
                "workout-date"
            ).value;

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


        const workout = {

            sport,

            workout_type:
                workoutType,

            date,

            distance:
                distanceValue
                    ? Number(distanceValue)
                    : null,

            duration:
                durationValue
                    ? Number(durationValue) * 60
                    : null,

            notes

        };


        try {

            const response = await fetch(
                `${API_URL}/workouts`,
                {

                    method: "POST",

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
                    "Failed to add workout."
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


    const distance =
        workout.distance !== null
            ? `${workout.distance} km`
            : "";


    const duration =
        workout.duration !== null
            ? formatDuration(
                workout.duration
            )
            : "";


    return `

        <div class="workout-card">

            <div class="workout-main">

                <div class="workout-icon">
                    ${icon}
                </div>


                <div>

                    <h3>
                        ${capitalize(
                            workout.workout_type
                        )}
                        ${capitalize(
                            workout.sport
                        )}
                    </h3>

                    <p class="workout-date">
                        ${formatDate(
                            workout.date
                        )}
                    </p>


                    <div class="workout-stats">

                        ${
                            distance
                                ? `<span>${distance}</span>`
                                : ""
                        }

                        ${
                            duration
                                ? `<span>${duration}</span>`
                                : ""
                        }

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


            <button
                class="delete-workout"
                data-id="${workout.id}"
            >
                Delete
            </button>

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


function capitalize(string) {

    if (!string) {
        return "";
    }

    return (
        string.charAt(0).toUpperCase() +
        string.slice(1)
    );

}
