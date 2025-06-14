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

  const phoneField = document.getElementById("phone_number");
  const phoneInput = document.getElementById("phone_number_input");

  const emailField = document.getElementById("email");
  const emailInput = document.getElementById("email_input");
  const form = document.getElementById("loginForm");

  if (userType === "tenant") {
    // Show name and phone number fields
    phoneField.classList.remove("hidden");
    phoneInput.disabled = false;
    phoneInput.required = true;
  } else if (userType === "landlord") {
    // Show email and phone number fields
    emailField.classList.remove("hidden");
    emailInput.disabled = false;
    emailInput.required = true;
  } else {
    showError("User type not selected. Please go back to onboarding.");
    window.location.href = "onboarding.html";
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Collect form input values
    const phone_number = document
      .getElementById("phone_number_input")
      .value.trim();
    const password = document.getElementById("password").value;
    const email = document.getElementById("email_input")?.value?.trim();

    // Prepare the request body and API endpoint based on user type
    let body = { password };
    let url = "";

    if (userType === "tenant") {
      if (!/^(070|080|081|090|091)\d{8}$/.test(phone_number)) {
        showError("Valid phone number required.");
        return;
      }
      // Add phone number for tenants
      body.phone_number = phone_number;
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
        window.location.href = "home.html"; // Redirect to the home page
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
});
