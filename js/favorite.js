//Importing functions from main.js
import { BASE_URL } from "./config.js";
import { fetchAndRenderLodges } from "./main.js";
import { showError, showSuccess } from "./alerts.js";
// Function to fetch and render favorite lodges
if (window.location.pathname.includes("favorite")) {
  fetchAndRenderLodges({
    endpoint: "/api/lodges/tenant/favorite",
    onEmptyMessage: "No lodges added to favorites yet.",
    isTenant: true,
  });
}
// Function to Get favorite lodge Id
export async function getFavoriteLodgeIds(
  token = localStorage.getItem("token")
) {
  if (!token) return [];

  try {
    const response = await fetch(`${BASE_URL}/api/lodges/tenant/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch favorites");

    const result = await response.json();
    const lodges = Array.isArray(result.lodges) ? result.lodges : [];

    return lodges.map((lodge) => lodge.id);
  } catch (err) {
    console.error("Error getting favorite lodge IDs:", err);
    return [];
  }
}
// Function to add to favorite
export async function addFavorite(lodgeId, iconElement) {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("Login required.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/lodges/${lodgeId}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to add to favorites");

    // Update the heart icon style
    iconElement.classList.remove("fa-regular");
    iconElement.classList.add("fa-solid", "text-[#ec1818]");
    setTimeout(() => {
      showSuccess("Added to favorites.");
    }, 100);
  } catch (error) {
    console.error(error);
    showError(error.message || "Could not add to favorites.");
  }
}

// Function to remove favorite
export async function removeFavorite(lodgeId, iconElement) {
  const token = localStorage.getItem("token");
  if (!token) return showError("Login required.");

  try {
    const response = await fetch(`${BASE_URL}/api/lodges/${lodgeId}/favorite`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to remove favorite.");

    iconElement.closest(".lodge-item").remove();
    setTimeout(() => {
      showSuccess("Removed from favorites.");
    }, 100);
  } catch (error) {
    showError(error.message || "Failed to remove favorite.");
  }
}
