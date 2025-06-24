document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isTenant = userType === "tenant";

  const lodgeContainer = document.querySelector(".lodge-container");
  const favoriteLink = document.getElementById("favoriteLink");
  const searchInput = document.querySelector("input[placeholder='Search']");

  const profile = document.getElementById("profile");
  const topNavMenu = document.getElementById("topNavMenu");

  console.log("User Type:", userType);

  if (!isTenant) {
    // Hide tenant-specific elements

    if (searchInput) searchInput.style.display = "none";
    if (favoriteLink) favoriteLink.style.display = "none";

    // Show only nav dots initially
    if (profile) profile.classList.remove("hidden");
  }

  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) errorContainer.style.display = "none";
  }

  function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");
    if (!errorContainer || !errorMessage) return;

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

  function showSuccess(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");
    if (!errorContainer || !errorMessage) return;

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

  async function getFavoriteLodgeIds() {
    if (!token || !isTenant) return [];
    try {
      const res = await fetch(`${BASE_URL}/api/lodges/tenant/favorite`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      return data.lodges.map((lodge) => lodge.id);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      return [];
    }
  }

  async function fetchLodges() {
    try {
      hideError();
      const res = await fetch(`${BASE_URL}/api/lodges/verified`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch lodges");
      const data = await res.json();
      const lodges = data.lodges || [];

      const favoriteIds = await getFavoriteLodgeIds();
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
            ${
              isTenant
                ? `<i id="lodge${lodge.id}" 
                      class="${heartClass} fa-heart text-[24px] cursor-pointer" 
                      onclick="addFav(${lodge.id})"></i>`
                : ""
            }
          </div>
        `;
        lodgeContainer.appendChild(lodgeElement);
      });
    } catch (err) {
      console.error("Error loading lodges:", err);
      lodgeContainer.innerHTML = "<p>Could not load lodges.</p>";
    }
  }

  async function addFav(lodgeId) {
    if (!token) return showError("Please login first.");
    try {
      const res = await fetch(`${BASE_URL}/api/lodges/${lodgeId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Favorite failed");

      const heartIcon = document.getElementById(`lodge${lodgeId}`);
      if (heartIcon) {
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid", "text-[#ec1818]");
      }

      showSuccess(result.message || "Added to favorites");
    } catch (err) {
      showError(err.message || "Could not add to favorites.");
    }
  }

  if (isTenant) {
    window.addFav = addFav;
  }

  await fetchLodges();
});
