// 📁 favorite.js

// Reusable error and success message handlers
function showError(message) {
  const container = document.getElementById("errorContainer");
  const messageEl = document.getElementById("errorMessage");

  messageEl.textContent = message;
  container.style.display = "block";
  container.style.backgroundColor = "#fee2e2";
  container.style.borderLeft = "4px solid #ef4444";
  container.style.color = "#b91c1c";
  container.style.padding = "12px";
  container.style.marginBottom = "16px";
  container.style.borderRadius = "8px";
  container.style.fontWeight = "500";

  setTimeout(() => (container.style.display = "none"), 5000);
}

function showSuccess(message) {
  const container = document.getElementById("errorContainer");
  const messageEl = document.getElementById("errorMessage");

  messageEl.textContent = message;
  container.style.display = "block";
  container.style.backgroundColor = "#dcfce7";
  container.style.borderLeft = "4px solid #22c55e";
  container.style.color = "#15803d";
  container.style.padding = "12px";
  container.style.marginBottom = "16px";
  container.style.borderRadius = "8px";
  container.style.fontWeight = "500";

  setTimeout(() => (container.style.display = "none"), 5000);
}

async function fetchFavorites() {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("You must be logged in to view favorites.");
    return;
  }

  const lodgeContainer = document.querySelector(".lodge-container");

  try {
    const response = await fetch(
      "http://localhost:5000/api/lodges/tenant/favorite",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to load favorites.");

    const result = await response.json();
    const lodges = result.lodges || [];
    lodgeContainer.innerHTML = "";

    if (lodges.length === 0) {
      showError("No favorite lodges found.");
      return;
    }

    lodges.forEach((lodge) => {
      const lodgeElement = document.createElement("div");
      lodgeElement.classList.add("lodge-item", "mt-[10px]", "max-w-[320px]");
      lodgeElement.innerHTML = `
          <img src="${
            lodge.images?.[0] || "../assets/images/default.jpg"
          }" alt="${lodge.name}" class="w-full h-60 rounded-xl object-cover" />
          <div class="flex justify-between items-center font-supreme font-[400] text-[12px] pt-[10px] px-[10px]">
            <div>
              <h3>${lodge.name}</h3>
              <p class="text-[#444343]">₦${lodge.price || "N/A"}</p>
            </div>
            <i class="fa-solid fa-heart text-[24px] text-[#ec1818] cursor-pointer" onclick="removeFavorite(${
              lodge.id
            }, this)"></i>
          </div>
        `;
      lodgeContainer.appendChild(lodgeElement);
    });
  } catch (err) {
    showError("Could not fetch favorites.");
    console.error(err);
  }
}

// Function to remove favorite
async function removeFavorite(lodgeId, iconElement) {
  const token = localStorage.getItem("token");
  if (!token) return showError("Login required.");

  try {
    const response = await fetch(
      `http://localhost:5000/api/lodges/${lodgeId}/favorite`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to remove favorite.");

    // Remove the lodge card from UI
    iconElement.closest(".lodge-item").remove();
    showSuccess("Removed from favorites.");
  } catch (error) {
    showError(error.message || "Failed to remove favorite.");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", fetchFavorites);
