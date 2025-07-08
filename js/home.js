import { fetchAndRenderLodges } from "./main.js";
import { BASE_URL } from "./config.js";

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
  const suggestionList = document.getElementById("suggestionList");
  const searchForm = document.getElementById("searchForm");

  // Hide irrelevant sections
  if (isTenant) landlordHeading?.classList.add("hidden");
  else {
    searchInput?.classList.add("hidden");
    favoriteLink?.classList.add("hidden");
    tenantHeading?.classList.add("hidden");
  }

  // Render lodges with heart icon if tenant
  fetchAndRenderLodges({
    endpoint: "/api/lodges/displayed",
    containerSelector: ".lodge-container",
    onEmptyMessage: "No lodges available yet.",
    showRoomCount: true,
    isTenant,
    token,
  });

  // Fetch areas once for dropdown
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

  // Update dropdown/input depending on filter selected
  async function updateFilterInput() {
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
  }

  await updateFilterInput();
  filterType.addEventListener("change", updateFilterInput);

  // Handle search input toggle
  searchInput?.addEventListener("focus", () => {
    searchFilterBox.classList.remove("hidden");
  });

  searchInput?.addEventListener("input", () => {
    searchFilterBox.classList.add("hidden");
  });

  document.addEventListener("click", (event) => {
    const isClickInsideInput = searchInput?.contains(event.target);
    const isClickInsideFilterBox = searchFilterBox.contains(event.target);
    if (!isClickInsideInput && !isClickInsideFilterBox) {
      searchFilterBox.classList.add("hidden");
    }
  });

  applySearchFilter.addEventListener("click", () => {
    const type = filterType.value;
    const value =
      type === "area_id" ? areaDropdown.value : filterValueInput.value.trim();
    if (!value) return;
    fetchFilteredLodges({ [type]: value });
    searchFilterBox.classList.add("hidden");
  });

  let debounceTimeout;
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim();
    clearTimeout(debounceTimeout);
    if (!query) {
      suggestionList.classList.add("hidden");
      suggestionList.innerHTML = "";
      return;
    }

    debounceTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/lodges/suggestions?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
          fetchAndRenderLodges({
            endpoint: `/api/lodges/search?${query}`,
            containerSelector: ".lodge-container",
            onEmptyMessage: "No lodges match your filter.",
            showRoomCount: true,
            isTenant,
            token,
          });
        } else {
          showError(message || "No lodges found for your search.");
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        showError("An error occurred while searching lodges.");
      });
  }
});
