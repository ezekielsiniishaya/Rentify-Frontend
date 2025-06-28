function showError(message) {
  const container = document.getElementById("errorContainer");
  const text = document.getElementById("errorMessage");
  if (!container || !text) return;

  text.textContent = message;
  container.classList.remove(
    "hidden",
    "bg-green-100",
    "border-green-500",
    "text-green-700"
  );
  container.classList.add("bg-red-100", "border-red-500", "text-red-700");

  setTimeout(() => container.classList.add("hidden"), 5000);
}

function showSuccess(message) {
  const container = document.getElementById("errorContainer");
  const text = document.getElementById("errorMessage");
  if (!container || !text) return;

  text.textContent = message;
  container.classList.remove(
    "hidden",
    "bg-red-100",
    "border-red-500",
    "text-red-700"
  );
  container.classList.add("bg-green-100", "border-green-500", "text-green-700");

  setTimeout(() => container.classList.add("hidden"), 5000);
}
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

async function fetchLodge() {
  const lodgeId = localStorage.getItem("selectedLodgeId");
  if (!lodgeId) {
    console.error("No lodge ID in storage");
    return;
  }

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

    // Wait for favorites
    const favoriteIds = await getFavoriteLodgeIds();

    populateLodgeDetails(lodgeData, favoriteIds); // Pass favorites
  } catch (err) {
    console.error("Error loading lodge:", err);
  }
}
function populateLodgeDetails(lodge, favoriteIds = []) {
  // Store landlord ID for later use
  localStorage.setItem("viewedLandlordId", lodge.host?.id);
  console.log("Viewed Landlord ID:", lodge.host?.id);
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

      // Toggle icon
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

  // Reviews
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
    return [];
  }
}
document.addEventListener("DOMContentLoaded", fetchLodge);
document.addEventListener("DOMContentLoaded", () => {
  const heartIcon = document.querySelector(".fa-heart");

  if (heartIcon) {
    heartIcon.addEventListener("click", async (e) => {
      e.preventDefault();

      const lodgeId = localStorage.getItem("selectedLodgeId");
      const token = localStorage.getItem("token");
      if (!token) return showError("Please login first.");

      try {
        const res = await fetch(
          `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodgeId}/favorite`,
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

        // Update heart icon
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid", "text-[#ec1818]");

        showSuccess(result.message || "Added to favorites");
      } catch (err) {
        showError(err.message || "Could not add to favorites.");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const profilePic = document.getElementById("hostImg");
  const imageModal = document.getElementById("imageModal");
  const enlargedImage = document.getElementById("enlargedImage");

  profilePic.addEventListener("click", () => {
    enlargedImage.src = profilePic.src;
    imageModal.classList.remove("hidden");
  });

  imageModal.addEventListener("click", () => {
    imageModal.classList.add("hidden");
  });
});
document.getElementById("submitReview").addEventListener("click", () => {
  const reviewText = document.getElementById("reviewText").value.trim();

  if (!reviewText) {
    showError("Please enter a review.");
    return;
  }

  // Example: Replace this with your actual lodge ID and API call
  const lodgeId = localStorage.getItem("selectedLodgeId");
  const token = localStorage.getItem("token");
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
        rating: 5, // Optional: Add rating selection UI
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      showSuccess("Review submitted successfully!");
      document.getElementById("reviewText").value = "";
      // Option 1: Reload all lodge data (including reviews)
      fetchLodge();

      // Option 2 (alternative): If API returns the new review, you could append it directly:
      // if (data.review) {
      //   const reviewSection = document.getElementById("reviewSection");
      //   const div = document.createElement("div");
      //   div.className = "m-2 p-2 bg-[#F8F9FE] min-w-[200px]";
      //   div.innerHTML = `
      //     <span class="font-semibold pb-2">@${data.review.tenant_name}</span>
      //     <p class="text-[12px]">${data.review.review_text}</p>
      //   `;
      //   reviewSection.appendChild(div);
      // }
    })
    .catch((err) => {
      console.error(err);
      alert("Something went wrong. Please try again.");
    });
});
document.addEventListener("DOMContentLoaded", () => {
  const contactBtn = document.getElementById("contactHostBtn");
  contactBtn.addEventListener("click", () => {
    const landlordId = localStorage.getItem("viewedLandlordId");

    if (!landlordId) {
      alert("Landlord information is missing.");
      return;
    }

    window.location.href = `/pages/landlord_profile.html`;
  });
});
