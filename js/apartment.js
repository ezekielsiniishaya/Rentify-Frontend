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
    const lodge = response.lodge;
    lodgeData = lodge;
    populateLodgeDetails(lodge);
  } catch (err) {
    console.error("Error loading lodge:", err);
  }
}

function populateLodgeDetails(lodge) {
  document.getElementById("lodgeTitle").textContent = lodge.name || "";
  document.getElementById("lodgeAddress").textContent = lodge.address || "";
  document.getElementById("lodgeDescription").textContent =
    lodge.description || "";
  document.getElementById("lodgeHost").textContent =
    "Hosted by " + (lodge.host?.name || "");
  document.getElementById("hostStatus").textContent = lodge.host?.status || "";
  document.getElementById("hostImg").src = lodge.host?.image || "";
  document.getElementById("price").textContent = "₦" + (lodge.price || "N/A");
  document.getElementById("duration").textContent = lodge.duration || "";

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
        <span class="font-semibold pb-2">@${r.user}</span>
        <p class="text-[12px]">${r.review}</p>
      `;
      reviewSection.appendChild(div);
    });
  }

  updateCarousel();
}

document.addEventListener("DOMContentLoaded", fetchLodge);
