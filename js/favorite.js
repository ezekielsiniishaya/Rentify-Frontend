const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";

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

// ✅ Use event listeners only (no inline onclick)
async function fetchFavorites() {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("You must be logged in to view favorites.");
    return;
  }

  const lodgeContainer = document.querySelector(".lodge-container");

  try {
    const response = await fetch(`${BASE_URL}/api/lodges/tenant/favorite`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
      lodgeElement.classList.add("lodge-item");

      // Create heart icon element
      const heartIcon = document.createElement("i");
      heartIcon.className =
        "fa-solid fa-heart text-[24px] text-[#ec1818] cursor-pointer";
      heartIcon.addEventListener("click", () =>
        removeFavorite(lodge.id, heartIcon)
      );

      lodgeElement.innerHTML = `
        <img src="${lodge.images?.[0] || "../assets/images/default.jpg"}" 
             alt="${lodge.name}" 
             class="w-full h-60 rounded-xl object-cover" />

        <div class="flex justify-between items-center font-supreme font-[400] text-[12px] pt-[10px] px-[10px]">
          <div>
            <h3>${lodge.name}</h3>
            <p class="text-[#444343]">₦${lodge.price || "N/A"}</p>
          </div>
          <div class="heart-icon-container"></div> <!-- placeholder -->
        </div>
      `;

      // Append heart icon to the placeholder div
      lodgeElement
        .querySelector(".heart-icon-container")
        .appendChild(heartIcon);

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
    const response = await fetch(`${BASE_URL}/api/lodges/${lodgeId}/favorite`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to remove favorite.");

    iconElement.closest(".lodge-item").remove();
    showSuccess("Removed from favorites.");
  } catch (error) {
    showError(error.message || "Failed to remove favorite.");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", fetchFavorites);
