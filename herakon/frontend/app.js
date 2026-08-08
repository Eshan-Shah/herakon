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