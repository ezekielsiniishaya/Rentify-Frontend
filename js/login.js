document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(
        "http://localhost:5000/api/landlords/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
        // Save token or session info if returned
        localStorage.setItem("token", data.token);
        window.location.href = "home.html"; // Redirect after login
      } else {
        console.error("Server Error:", data);
        alert(data.message || "An error occurred on the server.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server connection error.");
    }
  });
});
