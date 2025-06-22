document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");
  const lodgeContainer = document.querySelector(".lodge-container");

  // Function to display beautiful errors
  function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = message;
    errorContainer.style.display = "block";
    errorContainer.style.backgroundColor = "#fee2e2";
    errorContainer.style.borderLeft = "4px solid #ef4444";
    errorContainer.style.color = "#b91c1c";
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
    errorContainer.style.display = "block";
    errorContainer.style.backgroundColor = "#dcfce7";
    errorContainer.style.borderLeft = "4px solid #22c55e";
    errorContainer.style.color = "#166534";
    errorContainer.style.padding = "12px";
    errorContainer.style.marginBottom = "16px";
    errorContainer.style.borderRadius = "8px";
    errorContainer.style.fontWeight = "500";

    setTimeout(hideError, 5000);
  }

  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.style.display = "none";
  }

  // ✅ New: Function to get favorite lodge IDs
  async function getFavoriteLodgeIds() {
    if (!token) return [];

    try {
      const response = await fetch(`${BASE_URL}/api/lodges/tenant/favorite`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");
      const result = await response.json();
      return result.lodges.map((lodge) => lodge.id);
    } catch (err) {
      console.error("Error fetching favorite IDs:", err);
      return [];
    }
  }

  // ✅ Fetch and display lodges
  async function fetchLodges() {
    try {
      hideError();

      const response = await fetch(`${BASE_URL}/api/lodges/verified`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch lodges");

      const result = await response.json();
      let lodges = result.lodges || [];

      const favoriteIds = await getFavoriteLodgeIds(); // ✅ Await here
      lodgeContainer.innerHTML = "";

      if (lodges.length === 0) {
        showError("No lodges available at the moment.");
        return;
      }

      lodges.forEach((lodge) => {
        const isFavorite = favoriteIds.includes(lodge.id);
        const heartClass = isFavorite
          ? "fa-solid text-[#ec1818]"
          : "fa-regular";

        const lodgeElement = document.createElement("div");
        lodgeElement.classList.add(
          "lodge-item",
          "mt-[10px]",
          "max-width-[320px]"
        );

        lodgeElement.innerHTML = `
          <img src="${lodge.images?.[0] || "default-lodge.jpg"}" 
               alt="${lodge.name}" 
               class="w-full h-60 rounded-xl object-cover" />

          <div class="flex justify-between items-center font-supreme font-[400] text-[12px] pt-[10px] px-[10px]">
            <div>
              <h3>${lodge.name}</h3>
              <p class="text-[#444343]">${
                lodge.available_rooms
              } rooms available</p>
            </div>
            <i id="lodge${lodge.id}" 
               class="${heartClass} fa-heart text-[24px] cursor-pointer" 
               onclick="addFav(${lodge.id})"></i>
          </div>
        `;

        lodgeContainer.appendChild(lodgeElement);
      });
    } catch (error) {
      lodgeContainer.innerHTML = "<p>Could not load lodges at this time.</p>";
      console.error(error);
    }
  }

  // ✅ Add to favorite
  async function addFav(lodgeId) {
    hideError();
    if (!token) {
      showError("Please login to add to favorites.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/lodges/${lodgeId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add lodge to favorites");
      }

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

  // ✅ Expose to window
  window.addFav = addFav;

  // ✅ Run on load
  await fetchLodges();
});
