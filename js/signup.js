document.addEventListener("DOMContentLoaded", () => {
  const userType = localStorage.getItem("userType");
  const form = document.getElementById("signupForm");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const phoneField = document.getElementById("phone");
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";

  function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = message;
    errorContainer.className =
      "mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700";
    errorContainer.classList.remove("hidden");
    setTimeout(hideError, 5000);
  }

  function showSuccess(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorContainer.className =
      "mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700";
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
    setTimeout(hideError, 3000);
  }

  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.classList.add("hidden");
  }

  // Adjust form fields based on user type
  if (userType === "tenant") {
    nameField.classList.remove("hidden");
    emailField.classList.remove("hidden");
    phoneField.classList.add("hidden");
  } else if (userType === "landlord") {
    emailField.classList.remove("hidden");
  } else {
    alert("User type not selected. Please go back to onboarding.");
    window.location.href = "onboarding.html";
    return;
  }
  const signUpBtn = document.getElementById("signUpBtn");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Disable login button and show loading state
    signUpBtn.disabled = true;
    signUpBtn.textContent = "Signing up...";
    const phone_number = document.getElementById("phone_number").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const email = document.getElementById("emailField")?.value?.trim();
    const name = document.getElementById("nameField")?.value?.trim();

    let body = { phone_number, password };
    let url = "";

    if (userType === "tenant") {
      if (!email || !/^[a-z]+\.[ms]?\d{7}@st\.futminna\.edu\.ng$/.test(email)) {
        showError("Only FUTMinna student emails are allowed.");
        return;
      }
      body.name = name;
      body.email = email;
      url = "/api/tenants/register";
    } else if (userType === "landlord") {
      // Validate phone number
      if (!/^(070|080|081|090|091)\d{8}$/.test(phone_number)) {
        showError("Valid phone number required.");
        return;
      }
      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
        showError("A valid email address is required.");
        return;
      }

      body.email = email;
      url = "/api/landlords/register";
    }

    if (password.length < 6) {
      showError("Password too short.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
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
        form.classList.add("hidden");
        showSuccess(
          data.message || "Registered. Please check your email to verify."
        );
      } else {
        showError(data.message || data.error || "Signup failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Server error. Please try again.");
    }
  });
});
