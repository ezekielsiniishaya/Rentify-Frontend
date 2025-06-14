document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");
  const lodgeContainer = document.querySelector(".lodge-container");
  // Function to display beautiful errors
  function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = message;

    // Apply inline styles directly with JS
    errorContainer.style.display = "block";
    errorContainer.style.backgroundColor = "#fee2e2"; // Light red
    errorContainer.style.borderLeft = "4px solid #ef4444"; // Red border
    errorContainer.style.color = "#b91c1c"; // Red text
    errorContainer.style.padding = "12px";
    errorContainer.style.marginBottom = "16px";
    errorContainer.style.borderRadius = "8px";
    errorContainer.style.fontWeight = "500";

    setTimeout(hideError, 5000);
  }
  // Function to display beautiful success messages
  function showSuccess(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = message;

    // Apply green styles
    errorContainer.style.display = "block";
    errorContainer.style.backgroundColor = "#dcfce7"; // Light green
    errorContainer.style.borderLeft = "4px solid #22c55e"; // Green border
    errorContainer.style.color = "#166534"; // Green text
    errorContainer.style.padding = "12px";
    errorContainer.style.marginBottom = "16px";
    errorContainer.style.borderRadius = "8px";
    errorContainer.style.fontWeight = "500";

    setTimeout(hideError, 5000); // Reuse existing hideError function
  }

  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.style.display = "none";
  }
  // Letch lodges
  async function fetchLodges() {
    try {
      hideError(); // Ensure this is a defined function

      const response = await fetch(
        `http://localhost:5000/api/lodges/verified`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch lodges");

      const result = await response.json();
      let lodges = result.lodges;

      if (!Array.isArray(lodges)) {
        lodges = [];
      }

      const lodgeContainer = document.querySelector(".lodge-container");
      lodgeContainer.innerHTML = "";

      if (lodges.length === 0) {
        showError("No lodges available at the moment.");
        return;
      }

      lodges.forEach((lodge) => {
        const lodgeElement = document.createElement("div");
        lodgeElement.classList.add(
          "lodge-item",
          "mt-[10px]",
          "max-width-[320px]"
        );

        lodgeElement.innerHTML = `
          <img src="${lodge.images?.[0] || "default-lodge.jpg"}" 
               alt="${lodge.name}" 
               class="w-full h-60 rounded-xl" />
  
          <div class="flex justify-between items-center font-supreme font-[400] text-[12px] pt-[10px] px-[10px]">
            <div>
              <h3>${lodge.name}</h3>
              <p class="text-[#444343]">${
                lodge.available_rooms
              } rooms available</p>
            </div>
            <i id="lodge${
              lodge.id
            }" class="fa-regular fa-heart text-[24px]" onclick="addFav(${
          lodge.id
        })"></i>
          </div>
        `;

        lodgeContainer.appendChild(lodgeElement);
      });
    } catch (error) {
      const lodgeContainer = document.querySelector(".lodge-container");
      lodgeContainer.innerHTML = "<p>Could not load lodges at this time.</p>";
      console.error(error);
    }
  }
  async function addFav(lodgeId) {
    const token = localStorage.getItem("token");
    if (!token) {
      showError("Please login to add to favorites.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/lodges/${lodgeId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to add lodge to favorites");
      }

      // Assume success if response is OK
      const heartIcon = document.getElementById(`lodge${lodgeId}`);
      if (heartIcon) {
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid", "text-[#ec1818]");
      }

      showSuccess(result.message || "Lodge added to favorites!");
    } catch (error) {
      showError(error.message || "An error occurred while adding to favorites");
    }
  }

  // Expose globally
  window.addFav = addFav;

  await fetchLodges();
});
