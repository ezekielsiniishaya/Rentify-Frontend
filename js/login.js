document.addEventListener("DOMContentLoaded", () => {
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
    alert("User type not selected. Please go back to onboarding.");
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
      // Add phone number for tenants
      body.phone_number = phone_number;
      url = "/api/tenants/login";
    } else if (userType === "landlord") {
      // Add email for landlords
      body.email = email;
      url = "/api/landlords/login";
    }

    try {
      // Send the login request to the server
      const res = await fetch(`http://localhost:5000${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Parse the server response
      const data = await res.json();

      if (res.ok) {
        // Login successful
        alert("Login successful!");
        localStorage.setItem("token", data.token); // Save the token
        localStorage.setItem("userType", userType); // Re-save user type if needed
        window.location.href = "home.html"; // Redirect to the home page
      } else {
        // Handle server-side errors
        console.error("Server Error:", data);
        alert(data.error || "An error occurred on the server."); // Display server error message
      }
    } catch (error) {
      // Handle client-side or network errors
      console.error("Error:", error);
      alert("Server connection error.");
    }
  });
});
