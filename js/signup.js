document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the user type from localStorage (set during onboarding)
  const userType = localStorage.getItem("userType");
  const form = document.getElementById("signupForm");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");

  console.log(userType); // Debugging: Log the user type
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
  // Show relevant fields based on the user type
  if (userType === "tenant") {
    nameField.classList.remove("hidden"); // Show name field for tenants
  } else if (userType === "landlord") {
    emailField.classList.remove("hidden"); // Show email field for landlords
  } else {
    // Redirect to onboarding if user type is not set
    alert("User type not selected. Please go back to onboarding.");
    window.location.href = "onboarding.html";
    return;
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Collect form input values
    const phone_number = document.getElementById("phone_number").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const email = document.getElementById("emailField")?.value?.trim();
    const name = document.getElementById("nameField")?.value?.trim();

    // Client-side validation

    if (!/^(070|080|081|090|091)\d{8}$/.test(phone_number)) {
      showError("Valid phone number required.");
      return;
    }

    // Prepare the request body and API endpoint based on user type
    let body = { phone_number, password };
    let url = "";

    if (userType === "tenant") {
      if (!name) {
        showError("Name is required for tenants.");
        return;
      }
      body.name = name; // Add name for tenants
      url = "/api/tenants/register";
    } else if (userType === "landlord") {
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
        showError("A valid email address is required.");
        return;
      }

      body.email = email; // Add email for landlords
      url = "/api/landlords/register";
    }

    // Validate password length
    if (password.length < 6) {
      showError("Password too short.");
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      // Send the registration request to the server
      const res = await fetch(`http://localhost:5000${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        // Registration successful
        showSuccess("Registration successful!");

        window.location.href = "login.html"; // Redirect to login page
      } else {
        // Handle server-side validation errors
        showError(data.message || data.error || "Signup failed.");
      }
    } catch (error) {
      // Handle network or server errors
      console.error("Error:", error);
      showError("Server error. Please try again.");
    }
  });
});
