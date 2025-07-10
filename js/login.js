//Importing functions from main.js
import { BASE_URL } from "./config.js";
import { fetchAndRenderLodges } from "./main.js";
import { showError, showSuccess } from "./alerts.js";
// Clear old data
if (window.location.pathname.includes("login")) {
  localStorage.removeItem("token");
}
document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  // Display message from URL and optionally hide form
  (function checkRedirectMessage() {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");

    if (msg) {
      const decoded = decodeURIComponent(msg.replace(/\+/g, " "));
      showSuccess(decoded);

      // Hide the form if message is about verification
      if (decoded.toLowerCase().includes("verify your email")) {
        const form = document.getElementById("loginForm");
        if (form) form.classList.add("hidden");
      }
    }
  })();

  // Handle form submission
  const form = document.querySelector("form");
  const loginBtn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const password = document.getElementById("password").value;
    const email = document.getElementById("email_input")?.value?.trim();

    // Disable login button and show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    let body = { password };
    let url = "";

    if (userType === "tenant") {
      if (!email || !/^[a-z]+\.[ms]?\d{7}@st\.futminna\.edu\.ng$/.test(email)) {
        showError("Only FUTMinna student emails are allowed.");
        resetLoginBtn();
        return;
      }
      body.email = email;
      url = "/api/tenants/login";
    } else if (userType === "landlord") {
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
        showError("A valid email address is required.");
        resetLoginBtn();
        return;
      }
      body.email = email;
      url = "/api/landlords/login";
    }

    if (!password) {
      showError("Password is required.");
      resetLoginBtn();
      return;
    }

    if (password.length < 6) {
      showError("Password too short.");
      resetLoginBtn();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", userType);

        if (userType === "tenant") {
          window.location.href = "home.html";
        } else if (userType === "landlord") {
          window.location.href = "landlord_profile.html";
        }
      } else {
        console.error("Server Error:", data);
        showError(data.error || "An error occurred on the server.");
        resetLoginBtn();
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Server connection error.");
      resetLoginBtn();
    }
  });

  // Reset button function
  function resetLoginBtn() {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
  
});
