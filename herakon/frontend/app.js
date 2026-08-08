const API_URL = "http://localhost:8000";


// ==================================================
// ELEMENTS
// ==================================================

const authPage = document.getElementById("auth-page");
const dashboardPage = document.getElementById("dashboard-page");

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

const dashboardName =
    document.getElementById("dashboard-name");


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

        showDashboard(user);

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


            // Show dashboard

            loginForm.reset();

            showDashboard(data.user);

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


        showLogin();

    }
);


// ==================================================
// UI FUNCTIONS
// ==================================================

function showLogin() {

    authPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");

    registerView.classList.add("hidden");
    loginView.classList.remove("hidden");

    clearError();

}


function showDashboard(user) {

    authPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    userName.textContent =
        user.name;

    dashboardName.textContent =
        user.name;

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

const workoutFormContainer =
    document.getElementById(
        "workout-form-container"
    );

const workoutForm =
    document.getElementById(
        "workout-form"
    );

const workoutList =
    document.getElementById(
        "workout-list"
    );

const addWorkoutButton =
    document.getElementById(
        "add-workout-button"
    );

const cancelWorkoutButton =
    document.getElementById(
        "cancel-workout"
    );

// ==================================================
// WORKOUT FORM
// ==================================================

addWorkoutButton.addEventListener(
    "click",
    () => {

        workoutFormContainer.classList.remove(
            "hidden"
        );

        // Automatically use today's date

        document.getElementById(
            "workout-date"
        ).value =
            new Date().toISOString().split("T")[0];

    }
);


cancelWorkoutButton.addEventListener(
    "click",
    () => {

        workoutForm.reset();

        workoutFormContainer.classList.add(
            "hidden"
        );

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


            workoutForm.reset();

            workoutFormContainer.classList.add(
                "hidden"
            );


            await loadWorkouts();


        } catch (error) {

            alert(error.message);

        }

    }
);


// ==================================================
// LOAD WORKOUTS
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


        const workouts =
            await response.json();


        if (!response.ok) {

            throw new Error(
                workouts.detail ||
                "Failed to load workouts."
            );

        }


        renderWorkouts(workouts);


    } catch (error) {

        workoutList.innerHTML = `
            <p class="error">
                ${error.message}
            </p>
        `;

    }

}


// ==================================================
// DISPLAY WORKOUTS
// ==================================================

function renderWorkouts(workouts) {

    if (workouts.length === 0) {

        workoutList.innerHTML = `
            <div class="empty-state">

                <h3>No workouts yet</h3>

                <p>
                    Add your first workout above.
                </p>

            </div>
        `;

        return;

    }


    workoutList.innerHTML =
        workouts.map(
            workout => createWorkoutHTML(workout)
        ).join("");


    // Delete buttons

    document
        .querySelectorAll(".delete-workout")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteWorkout(
                    button.dataset.id
                )
            );

        });

}


// ==================================================
// WORKOUT CARD
// ==================================================

function createWorkoutHTML(workout) {

    const icons = {

        swim: "🏊",

        bike: "🚴",

        run: "🏃",

        gym: "🏋️"

    };


    const icon =
        icons[workout.sport] || "🏋️";


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
// DELETE WORKOUT
// ==================================================

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
// HELPERS
// ==================================================

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