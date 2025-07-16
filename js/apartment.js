import { showError, showSuccess } from "./alerts.js";

// === Overlay Handlers ===
const overlay = document.getElementById("loadingOverlay");
function showOverlay() {
  overlay.style.display = "flex";
}
function hideOverlay() {
  if (overlay) overlay.style.display = "none";
}

// === Carousel & Lodge Data Setup ===
let currentImg = 0;
let lodgeData = null;

const lodgeImg = document.getElementById("lodgeImg");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const carouselDots = document.getElementById("carouselDots");

function updateCarousel() {
  if (!lodgeData || !lodgeData.images?.length) return;
  lodgeImg.src = lodgeData.images[currentImg];
  carouselDots.innerHTML = "";
  lodgeData.images.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className =
      "inline-block w-2 h-2 rounded-full " +
      (index === currentImg ? "bg-[#EC704A]" : "bg-gray-300");
    dot.style.cursor = "pointer";
    dot.onclick = () => {
      currentImg = index;
      updateCarousel();
    };
    carouselDots.appendChild(dot);
  });
}

prevBtn.onclick = () => {
  if (!lodgeData) return;
  currentImg =
    (currentImg - 1 + lodgeData.images.length) % lodgeData.images.length;
  updateCarousel();
};

nextBtn.onclick = () => {
  if (!lodgeData) return;
  currentImg = (currentImg + 1) % lodgeData.images.length;
  updateCarousel();
};

// === Main Fetch Function ===
async function fetchLodge() {
  const lodgeId = localStorage.getItem("selectedLodgeId");
  if (!lodgeId) {
    console.error("No lodge ID in storage");
    return;
  }

  showOverlay();

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodgeId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch lodge data");

    const response = await res.json();
    lodgeData = response.lodge;

    const favoriteIds = await getFavoriteLodgeIds();
    populateLodgeDetails(lodgeData, favoriteIds);
  } catch (err) {
    console.error("Error loading lodge:", err);
    showError("Could not load lodge data.");
  } finally {
    hideOverlay();
  }
}

// === Populate Lodge Details ===
function populateLodgeDetails(lodge, favoriteIds = []) {
  const user = localStorage.getItem("userType");
  // Set viewed landlord ID for tenant viewing landlord profile
  if (user === "tenant") {
    localStorage.setItem("viewedLandlordId", lodge.host?.id);
  }

  const isFavorite = favoriteIds.includes(lodge.id);
  const heartClass = isFavorite ? "fa-solid text-[#ec1818]" : "fa-regular";

  const heartContainer = document.getElementById("heart");
  heartContainer.innerHTML = `
    <i id="lodge${lodge.id}" 
       class="${heartClass} fa-heart text-[24px] cursor-pointer">
    </i>
  `;

  const heartIcon = heartContainer.querySelector("i");
  heartIcon.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) return showError("Please login first.");

    try {
      const res = await fetch(
        `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodge.id}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Favorite failed");

      heartIcon.classList.remove("fa-regular", "text-[#ec1818]");
      heartIcon.classList.add("fa-solid", "text-[#ec1818]");

      showSuccess(result.message || "Added to favorites");
    } catch (err) {
      showError(err.message || "Could not add to favorites.");
    }
  });

  document.getElementById("lodgeTitle").textContent = lodge.name || "";
  document.getElementById("lodgeAddress").textContent = lodge.address || "";
  document.getElementById("lodgeDescription").textContent =
    lodge.description || "";
  document.getElementById("lodgeHost").textContent =
    "Hosted by " + (lodge.host?.name || "");
  document.getElementById("hostStatus").innerHTML = lodge.host
    ?.verification_status
    ? `<span class="verify">Verified</span>`
    : `<span class="not-verify">Not Verified</span>`;
  document.getElementById("hostImg").src = lodge.host?.profile_picture || "";
  document.getElementById("price").textContent = "₦" + (lodge.price || "N/A");

  const reviewSection = document.getElementById("reviewSection");
  reviewSection.innerHTML = "";

  if (!lodge.reviews || lodge.reviews.length === 0) {
    const div = document.createElement("div");
    div.className = "pt-2 min-w-[200px]";
    div.innerHTML = `
      <span class="font-semibold pb-2">Review(0)</span>
      <p class="text-[12px]">No reviews yet</p>
    `;
    reviewSection.appendChild(div);
  } else {
    lodge.reviews.forEach((r) => {
      const div = document.createElement("div");
      div.className = "m-2 p-2 bg-[#F8F9FE] min-w-[200px]";
      div.innerHTML = `
        <span class="font-semibold pb-2">@${r.tenant_name}</span>
        <p class="text-[12px]">${r.review_text}</p>
      `;
      reviewSection.appendChild(div);
    });
  }

  updateCarousel();
}

// === Get Favorite Lodges ===
async function getFavoriteLodgeIds() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `https://rentify-backend-production-f85a.up.railway.app/api/lodges/tenant/favorite`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch favorites");
    const data = await res.json();
    return data.lodges.map((lodge) => lodge.id);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    showError("Could not load favorite lodges.");
    return [];
  }
}

// === Review Submit ===
document.getElementById("submitReview").addEventListener("click", () => {
  const reviewText = document.getElementById("reviewText").value.trim();
  if (!reviewText) return showError("Please enter a review.");

  const lodgeId = localStorage.getItem("selectedLodgeId");
  const token = localStorage.getItem("token");

  showOverlay();

  fetch(
    `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodgeId}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        review_text: reviewText,
        rating: 5,
      }),
    }
  )
    .then(async (res) => {
      const data = await res.json();
      hideOverlay();
      if (!res.ok) {
        // Show backend error if present
        showError(data.error || "Review submission failed.");
        return;
      }

      showSuccess("Review submitted successfully!");
      document.getElementById("reviewText").value = "";
      fetchLodge(); // Reload lodge to show the new review
    })
    .catch((err) => {
      console.error("Network or unexpected error:", err);
      showError("Something went wrong. Please try again.");
    });
});

// === DOMContentLoaded Setup ===
document.addEventListener("DOMContentLoaded", () => {
  fetchLodge();

  const profilePic = document.getElementById("hostImg");
  const imageModal = document.getElementById("imageModal");
  const enlargedImage = document.getElementById("enlargedImage");

  profilePic?.addEventListener("click", () => {
    enlargedImage.src = profilePic.src;
    imageModal.classList.remove("hidden");
  });

  imageModal?.addEventListener("click", () => {
    imageModal.classList.add("hidden");
  });

  const contactBtn = document.getElementById("contactHostBtn");
  contactBtn?.addEventListener("click", () => {
    const landlordId = localStorage.getItem("viewedLandlordId");
    if (!landlordId) return showError("Only tenants can contact hosts.");
    window.location.href = `/pages/landlord_profile.html`;
  });
});
