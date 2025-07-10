import { fetchAndRenderLodges } from "./main.js";
import { BASE_URL } from "./config.js";
import { initFeedback } from "./feedback.js";
// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", async () => {
  // Retrieve authentication and user type info from localStorage
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isTenant = userType === "tenant";

  // Get references to DOM elements
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

  // Hide or show sections based on user type
  if (isTenant) landlordHeading?.classList.add("hidden");
  else {
    searchInput?.classList.add("hidden");
    favoriteLink?.classList.add("hidden");
    tenantHeading?.classList.add("hidden");
  }
  const hamburgerButton = document.getElementById("hamburgerButton");
  const hamburgerMenu = document.getElementById("hamburgerMenu");

  hamburgerButton.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("hidden");
  });
  document.getElementById("feedback")?.addEventListener("click", initFeedback);
  // Optional: Close menu when clicking outside
  window.addEventListener("click", function (e) {
    if (
      !hamburgerButton.contains(e.target) &&
      !hamburgerMenu.contains(e.target)
    ) {
      hamburgerMenu.classList.add("hidden");
    }
  });

  // Add your logout logic here
  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Example: Clear storage and redirect
    localStorage.clear();
    window.location.href = "login.html";
  });
  // Render lodges, showing heart icon if user is a tenant
  const overlay = document.getElementById("loadingOverlay");

  fetchAndRenderLodges({
    endpoint: "/api/lodges/displayed",
    containerSelector: ".lodge-container",
    onEmptyMessage: "No lodges available yet.",
    showRoomCount: true,
    isTenant,
    token,
  }).finally(() => {
    //Remove blur overlay after lodges are ready
    if (overlay) overlay.style.display = "none";
  });

  // Fetch available areas for filtering (used in dropdown)
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

  // Update filter input UI based on selected filter type
  async function updateFilterInput() {
    const selected = filterType.value;

    if (selected === "area_id") {
      // Show area dropdown, hide value input
      filterValueLabel.classList.add("hidden");
      areaDropdownLabel.classList.remove("hidden");

      // Populate area dropdown if not already done
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
      // Show value input, hide area dropdown
      filterValueLabel.classList.remove("hidden");
      areaDropdownLabel.classList.add("hidden");
    }
  }

  // Initialize filter input UI
  await updateFilterInput();
  filterType.addEventListener("change", updateFilterInput);

  // Show filter box when search input is focused
  searchInput?.addEventListener("focus", () => {
    searchFilterBox.classList.remove("hidden");
  });

  // Hide filter box when typing in search input
  searchInput?.addEventListener("input", () => {
    searchFilterBox.classList.add("hidden");
  });

  // Hide filter box when clicking outside of it or the search input
  document.addEventListener("click", (event) => {
    const isClickInsideInput = searchInput?.contains(event.target);
    const isClickInsideFilterBox = searchFilterBox.contains(event.target);
    if (!isClickInsideInput && !isClickInsideFilterBox) {
      searchFilterBox.classList.add("hidden");
    }
  });

  // Apply search filter when button is clicked
  applySearchFilter.addEventListener("click", () => {
    const type = filterType.value;
    const value =
      type === "area_id" ? areaDropdown.value : filterValueInput.value.trim();
    if (!value) return;
    fetchFilteredLodges({ [type]: value });
    searchFilterBox.classList.add("hidden");
  });

  // Debounce timer for autosuggest
  let debounceTimeout;
  // Handle autosuggest for search input
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

        // Populate suggestion list with results
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
    }, 300); // Debounce delay
  });

  // Handle search form submission
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = searchInput.value.trim();
    if (name) fetchFilteredLodges({ name });
  });

  // Fetch and render lodges based on filter/search query
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
          // Render lodges if found
          fetchAndRenderLodges({
            endpoint: `/api/lodges/search?${query}`,
            containerSelector: ".lodge-container",
            onEmptyMessage: "No lodges match your filter.",
            showRoomCount: true,
            isTenant,
            token,
          });
        } else {
          // Show error message if no lodges found
          showError(message || "No lodges found for your search.");
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        showError("An error occurred while searching lodges.");
      });
  }
});
