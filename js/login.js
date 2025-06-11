document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the user type from localStorage (set during onboarding)
  const userType = localStorage.getItem("userType");
  const form = document.getElementById("loginForm");
  const phoneField = document.getElementById("phone_number");
  const emailField = document.getElementById("email");

  console.log(userType); // Debugging: Log the user type

  // Show relevant fields based on the user type
  if (userType === "tenant") {
    // Show the phone field for tenants
    phoneField.classList.remove("hidden");
  } else if (userType === "landlord") {
    // Show the email field for landlords
    emailField.classList.remove("hidden");
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
        alert(data.message || "An error occurred on the server.");
      }
    } catch (error) {
      // Handle client-side or network errors
      console.error("Error:", error);
      alert("Server connection error.");
    }
  });
});
