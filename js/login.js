document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  // Function to display beautiful errors
  function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(hideError, 5000);
  }
  // Function to show success messages
  function showSuccess(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    // Change styling for success message
    errorContainer.className =
      "mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700";
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");

    // Auto-hide after 3 seconds
    setTimeout(hideError, 3000);
  }

  // Function to hide errors
  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.classList.add("hidden");
  }
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

  const phoneField = document.getElementById("phone_number");
  const phoneInput = document.getElementById("phone_number_input");

  const emailField = document.getElementById("email");
  const emailInput = document.getElementById("email_input");
  const form = document.getElementById("loginForm");

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const password = document.getElementById("password").value;
    const email = document.getElementById("email_input")?.value?.trim();

    // Prepare the request body and API endpoint based on user type
    let body = { password };
    let url = "";

    if (userType === "tenant") {
      if (!email || !/^[a-z]+\.[ms]?\d{7}@st\.futminna\.edu\.ng$/.test(email)) {
        showError("Only FUTMinna student emails are allowed.");
        return;
      }
      body.email = email;
      url = "/api/tenants/login";
    } else if (userType === "landlord") {
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
        showError("A valid email address is required.");
        return;
      }
      // Add email for landlords
      body.email = email;
      url = "/api/landlords/login";
    }
    if (!password) {
      showError("Password is required.");
      return;
    }
    // Validate password length
    if (password.length < 6) {
      showError("Password too short.");
      return;
    }

    try {
      // Send the login request to the server
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Parse the server response
      const data = await res.json();

      if (res.ok) {
        // Login successful
        showSuccess("Login successful!");
        localStorage.setItem("token", data.token); // Save the token
        localStorage.setItem("userType", userType); // Re-save user type if needed
        if (userType == "tenant") {
          window.location.href = "home.html"; // Redirect to the home page for tenants
        } else if (userType == "landlord") {
          window.location.href = "landlord_profile.html";
        }
      } else {
        // Handle server-side errors
        console.error("Server Error:", data);
        showError(data.error || "An error occurred on the server."); // Display server error message
      }
    } catch (error) {
      // Handle client-side or network errors
      console.error("Error:", error);
      showError("Server connection error.");
    }
  });
  // Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    showSuccess("Logged out successfully.");
    window.location.href = "login.html";
  }
});
