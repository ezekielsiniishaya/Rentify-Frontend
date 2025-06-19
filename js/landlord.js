document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");

  const errorContainer = document.getElementById("errorContainer");
  const errorMessage = document.getElementById("errorMessage");

  function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
    setTimeout(() => errorContainer.classList.add("hidden"), 5000);
  }

  function showSuccess(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
    errorContainer.classList.replace("bg-red-100", "bg-green-100");
    errorContainer.classList.replace("border-red-500", "border-green-500");
    errorContainer.classList.replace("text-red-700", "text-green-700");
    setTimeout(() => errorContainer.classList.add("hidden"), 5000);
  }

  async function fetchLandlordData() {
    try {
      const response = await fetch(`${BASE_URL}/api/landlords/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Unable to fetch landlord data");

      const data = await response.json();
      const landlord = data.landlord || {};
      const lodges = landlord.lodges || [];

      // Update personal details
      document.querySelector(".profile-image").src =
        landlord.profile_picture || "../assets/images/avatar.png";

      document
        .querySelectorAll(".personal-details .detail-item")
        .forEach((item) => {
          const label = item.querySelector(".label").textContent.trim();
          const valueElement = item.querySelector(".value");

          switch (label) {
            case "Full Name:":
              valueElement.textContent = landlord.name || "N/A";
              break;
            case "Gender:":
              valueElement.textContent = landlord.gender || "N/A";
              break;
            case "Address:":
              valueElement.textContent = landlord.address || "N/A";
              break;
            case "Phone Number:":
              valueElement.textContent = landlord.phone_number || "N/A";
              break;
            case "E-mail:":
              valueElement.textContent = landlord.email || "N/A";
              break;
            case "Account Created:":
              valueElement.textContent = new Date(
                landlord.account_created
              ).toDateString();

              break;
            case "Status:":
              valueElement.innerHTML = landlord.verification_status
                ? `<span class="verify inline-flex items-center text-green-600">Verified</span>`
                : `<span class="not-verify inline-flex items-center text-red-600">Not Verified</span>`;
              break;
            default:
              break;
          }
        });

      // Also update top name and email
      document.querySelector("h2.text-2xl").textContent =
        landlord.name || "Landlord";
      document.querySelector(".tp-email").textContent = landlord.email || "";
      console.log(lodges);
      const lodgeDiv = document.getElementById("landlordLodges");
      console.log(lodges[0].name);

      const lodgeName = document.getElementById("l-name");
      lodgeName.textContent = lodges[0].name;
    } catch (error) {
      console.error(error);
      showError(error.message || "An error occurred");
    }
  }
  await fetchLandlordData();
});
