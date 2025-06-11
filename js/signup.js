document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the user type from localStorage (set during onboarding)
  const userType = localStorage.getItem("userType");
  const form = document.getElementById("signupForm");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");

  console.log(userType); // Debugging: Log the user type

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

    // Validate password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare the request body and API endpoint based on user type
    let body = { phone_number, password };
    let url = "";

    if (userType === "tenant") {
      body.name = name; // Add name for tenants
      url = "/api/tenants/register";
    } else if (userType === "landlord") {
      body.email = email; // Add email for landlords
      url = "/api/landlords/register";
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
        alert("Registration successful!");

        window.location.href = "login.html"; // Redirect to login page
      } else {
        // Handle server-side validation errors
        alert(data.message || data.error || "Signup failed.");
      }
    } catch (error) {
      // Handle network or server errors
      console.error("Error:", error);
      alert("Server error. Please try again.");
    }
  });
});
