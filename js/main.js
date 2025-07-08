// main.js
import { BASE_URL } from "./config.js";
import {
  addFavorite,
  removeFavorite,
  getFavoriteLodgeIds,
} from "./favorite.js";

import { showSuccess, showError, hideError } from "./alerts.js";

// Function to fetch and render lodges
export async function fetchAndRenderLodges({
  endpoint = "/api/lodges/verified",
  containerSelector = ".lodge-container",
  onEmptyMessage = "No lodges available at the moment.",
  showRoomCount = true,
  isTenant = false,
  token = localStorage.getItem("token"),
}) {
  const lodgeContainer = document.querySelector(containerSelector);
  if (!lodgeContainer) {
    console.warn("Lodge container not found:", containerSelector);
    return;
  }

  try {
    hideError();

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch lodges");

    const data = await res.json();
    const lodges = data.lodges || [];

    // Get favorite lodge IDs for tenant view
    const favoriteIds = isTenant ? await getFavoriteLodgeIds(token) : [];

    lodgeContainer.innerHTML = "";

    if (lodges.length === 0) {
      showError(onEmptyMessage);
      return;
    }

    lodges.forEach((lodge) => {
      const isFavorite = favoriteIds.includes(lodge.id);
      const heartClass = isFavorite ? "fa-solid text-[#ec1818]" : "fa-regular";

      const lodgeElement = document.createElement("div");
      lodgeElement.classList.add(
        "lodge-item",
        "mt-[10px]",
        "max-width-[320px]"
      );

      lodgeElement.innerHTML = `
        <div class="lodge-card cursor-pointer" data-id="${lodge.id}">
          <img src="${lodge.images?.[0] || "../assets/images/default.jpg"}" 
               alt="${lodge.name}" 
               class="w-full h-60 rounded-xl object-cover" />
          <div class="flex justify-between items-center font-supreme font-[400] text-[12px] pt-[10px] px-[10px]">
            <div>
              <h3>${lodge.name}</h3>
              <p class="text-[#444343]">
                ${
                  showRoomCount
                    ? `${lodge.available_rooms} rooms available`
                    : ""
                }
              </p>
            </div>
            <div class="icon-container"></div> <!-- FIXED: actual container -->
          </div>
        </div>
      `;

      // Only add heart icon if tenant
      if (isTenant) {
        const heartIcon = document.createElement("i");
        heartIcon.className = `${heartClass} fa-heart text-[24px] cursor-pointer`;
        heartIcon.id = `lodge${lodge.id}`;

        heartIcon.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isFavorite) {
            removeFavorite(lodge.id, heartIcon);
          } else {
            addFavorite(lodge.id, heartIcon);
          }
        });

        lodgeElement.querySelector(".icon-container")?.appendChild(heartIcon);
      }

      lodgeContainer.appendChild(lodgeElement);

      // Handle click on lodge card
      lodgeElement
        .querySelector(".lodge-card")
        ?.addEventListener("click", (e) => {
          if (e.target.classList.contains("fa-heart")) return;
          localStorage.setItem("selectedLodgeId", lodge.id);
          window.location.href = "/pages/apartment.html";
        });
    });
  } catch (err) {
    console.error("Error loading lodges:", err);
    showError("Could not load lodges. Please try again later."); 
  }
}
