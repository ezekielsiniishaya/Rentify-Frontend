const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isTenant = userType === "tenant";

  const lodgeContainer = document.querySelector(".lodge-container");
  const favoriteLink = document.getElementById("favoriteLink");
  const searchInput = document.getElementById("searchInput");
  const tenantHeading = document.getElementById("tenant-heading");
  const landlordHeading = document.getElementById("landlord-heading");
  const filterType = document.getElementById("filterType");
  const filterValueLabel = document.getElementById("filterValueLabel");
  const filterValueInput = document.getElementById("filterValue");
  const areaDropdownLabel = document.getElementById("areaDropdownLabel");
  const areaDropdown = document.getElementById("areaDropdown");
  const searchFilterBox = document.getElementById("searchFilterBox");
  const applySearchFilter = document.getElementById("applySearchFilter");

  if (!isTenant) {
    if (searchInput) searchInput.style.display = "none";
    if (favoriteLink) favoriteLink.style.display = "none";
    if (tenantHeading) tenantHeading.style.display = "none";
  } else {
    if (landlordHeading) landlordHeading.style.display = "none";
  }

  function hideError() {
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) errorContainer.style.display = "none";
  }

  function showError(message) {
    const container = document.getElementById("errorContainer");
    const text = document.getElementById("errorMessage");
    if (!container || !text) return;

    text.textContent = message;

    // Tailwind fix: remove hidden, ensure visible
    container.classList.remove("hidden");
    container.classList.add("block");
    container.style.display = "block"; // extra safety

    container.style.backgroundColor = "#fee2e2";
    container.style.borderLeft = "4px solid #ef4444";
    container.style.color = "#b91c1c";
    container.style.padding = "12px";
    container.style.marginBottom = "16px";
    container.style.borderRadius = "8px";
    container.style.fontWeight = "500";

    // Hide again after 5s
    setTimeout(() => {
      container.classList.add("hidden");
      container.classList.remove("block");
    }, 5000);
  }

  function showSuccess(message) {
    const container = document.getElementById("errorContainer");
    const text = document.getElementById("errorMessage");
    if (!container || !text) return;

    text.textContent = message;
    container.style.display = "block";
    container.style.backgroundColor = "#dcfce7";
    container.style.borderLeft = "4px solid #22c55e";
    container.style.color = "#166534";
    container.style.padding = "12px";
    container.style.marginBottom = "16px";
    container.style.borderRadius = "8px";
    container.style.fontWeight = "500";

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
          <div class="lodge-card cursor-pointer" data-id="${lodge.id}">
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
          </div>
        `;
        lodgeContainer.appendChild(lodgeElement);

        lodgeElement
          .querySelector(".lodge-card")
          .addEventListener("click", (e) => {
            if (e.target.classList.contains("fa-heart")) return;
            localStorage.setItem("selectedLodgeId", lodge.id);
            window.location.href = "/pages/apartment.html";
          });
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

  // 🧠 Filter logic
  filterType.addEventListener("change", async () => {
    const selected = filterType.value;

    if (selected === "area_id") {
      filterValueLabel.classList.add("hidden");
      areaDropdownLabel.classList.remove("hidden");

      if (areaDropdown.children.length <= 1) {
        const areas = await fetchAreas();
        areas.forEach((area) => {
          const option = document.createElement("option");
          option.value = area.id;
          option.textContent = area.name;
          areaDropdown.appendChild(option);
        });
      }
    } else {
      filterValueLabel.classList.remove("hidden");
      areaDropdownLabel.classList.add("hidden");
    }
  });

  applySearchFilter.addEventListener("click", (event) => {
    const isClickInsideInput = searchInput.contains(event.target);
    const isClickInsideFilterBox = searchFilterBox.contains(event.target);
    const isClickInsideSuggestions = suggestionList.contains(event.target);

    if (
      !isClickInsideInput &&
      !isClickInsideFilterBox &&
      !isClickInsideSuggestions
    ) {
      suggestionList.classList.add("hidden");
    }

    const type = filterType.value;
    const value =
      type === "area_id" ? areaDropdown.value : filterValueInput.value.trim();

    if (!value) return;
    fetchFilteredLodges({ [type]: value });
    searchFilterBox.classList.add("hidden");
  });

  searchInput.addEventListener("focus", () => {
    searchFilterBox.classList.remove("hidden");
  });

  searchInput.addEventListener("input", () => {
    searchFilterBox.classList.add("hidden");
  });
  const suggestionList = document.getElementById("suggestionList");

  let debounceTimeout;
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    searchFilterBox.classList.add("hidden");
    clearTimeout(debounceTimeout);

    if (!query) {
      suggestionList.classList.add("hidden");
      suggestionList.innerHTML = "";
      return;
    }

    debounceTimeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/api/lodges/suggestions?q=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (!Array.isArray(data.lodges) || data.lodges.length === 0) {
          suggestionList.classList.add("hidden");
          suggestionList.innerHTML = "";
          return;
        }

        suggestionList.innerHTML = "";
        data.lodges.forEach((lodge) => {
          const li = document.createElement("li");
          li.textContent = lodge.name;
          li.className = "px-3 py-2 hover:bg-gray-200 cursor-pointer";
          li.addEventListener("click", () => {
            searchInput.value = lodge.name;
            suggestionList.classList.add("hidden");
            fetchFilteredLodges({ name: lodge.name });
          });
          suggestionList.appendChild(li);
        });
        suggestionList.classList.remove("hidden");
      } catch (err) {
        console.error("Autosuggest error:", err);
      }
    }, 300);
  });

  const searchForm = document.getElementById("searchForm");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = searchInput.value.trim();
    if (name) fetchFilteredLodges({ name });
  });

  function fetchFilteredLodges(queryParams) {
    const query = new URLSearchParams(queryParams).toString();

    fetch(`${BASE_URL}/api/lodges/search?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        lodgeContainer.innerHTML = "";
        const lodges = data?.lodges;
        const message = data?.message;

        if (Array.isArray(lodges) && lodges.length > 0) {
          renderLodges(lodges);
        } else {
          console.log("Showing Error!");
          showError(message || "No lodges found for your search.");
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        showError("An error occurred while searching lodges.");
      });
  }

  function renderLodges(lodges) {
    lodgeContainer.innerHTML = "";
    lodges.forEach((lodge) => {
      const lodgeElement = document.createElement("div");
      lodgeElement.classList.add(
        "lodge-item",
        "mt-[10px]",
        "max-width-[320px]"
      );
      lodgeElement.innerHTML = `
        <div class="lodge-card cursor-pointer" data-id="${lodge.id}">
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
          </div>
        </div>
      `;
      lodgeElement
        .querySelector(".lodge-card")
        .addEventListener("click", () => {
          localStorage.setItem("selectedLodgeId", lodge.id);
          window.location.href = "/pages/apartment.html";
        });
      lodgeContainer.appendChild(lodgeElement);
    });
  }

  async function fetchAreas() {
    try {
      const res = await fetch(`${BASE_URL}/api/lodges/areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch areas");
      return data.areas;
    } catch (err) {
      console.error("Error fetching areas:", err);
      return [];
    }
  }

  await fetchLodges();
  async function updateFilterInput() {
    const selected = filterType.value;

    if (selected === "area_id") {
      filterValueLabel.classList.add("hidden");
      areaDropdownLabel.classList.remove("hidden");

      // Populate area dropdown only once
      if (areaDropdown.children.length <= 1) {
        const areas = await fetchAreas();
        areas.forEach((area) => {
          const option = document.createElement("option");
          option.value = area.id;
          option.textContent = area.name;
          areaDropdown.appendChild(option);
        });
      }
    } else {
      filterValueLabel.classList.remove("hidden");
      areaDropdownLabel.classList.add("hidden");
    }
  }
  filterType.addEventListener("change", updateFilterInput);
  await updateFilterInput();
  document.addEventListener("click", (event) => {
    const isClickInsideInput = searchInput.contains(event.target);
    const isClickInsideFilterBox = searchFilterBox.contains(event.target);

    if (!isClickInsideInput && !isClickInsideFilterBox) {
      searchFilterBox.classList.add("hidden");
    }
  });
});
