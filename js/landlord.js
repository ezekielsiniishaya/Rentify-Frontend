/**
 * Toggles the visibility of a menu by ID, while hiding all others.
 * This is used for menus like lodge options (Edit, Delete, etc.).
 *
 * @param {string} id - The ID of the menu element to toggle.
 */
function toggleNav(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const isVisible = el.classList.contains("show");

  // Close ALL menus regardless of type
  document
    .querySelectorAll(
      ".imgNavMenu, .nav-menu, #topNavMenu, #dp_menu, #lodgeMenu1, #lodgeMenu2"
    )
    .forEach((menu) => menu.classList.remove("show"));

  // Show clicked menu if it wasn't already visible
  if (!isVisible) {
    el.classList.add("show");
  }
}

/**
 * Closes all open menus when the user clicks outside any menu or dot icon.
 */
document.addEventListener("click", (e) => {
  const isMenuClick =
    e.target.closest(".img-dots") ||
    e.target.closest(".imgNavMenu") ||
    e.target.closest(".nav-dots") ||
    e.target.closest(".nav-menu") ||
    e.target.closest("#dp_menu") ||
    e.target.closest("#topNavMenu") ||
    e.target.closest(".camera-button");

  if (!isMenuClick) {
    document
      .querySelectorAll(".imgNavMenu, .nav-menu, #dp_menu, #topNavMenu")
      .forEach((menu) => menu.classList.remove("show"));
  }
});
async function deleteLodge(lodgeId, token) {
  try {
    const response = await fetch(
      `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodgeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Lodge deleted successfully:", data);
      return data;
    } else {
      console.error("Failed to delete lodge:", data.error || data);
      return null;
    }
  } catch (err) {
    console.error("Error deleting lodge:", err.message);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");

  const errorContainer = document.getElementById("errorContainer");
  const errorMessage = document.getElementById("errorMessage");

  function showError(message) {
    if (!errorContainer || !errorMessage) return;
    errorMessage.textContent = message;

    errorContainer.classList.remove("hidden");
    errorContainer.classList.remove(
      "bg-green-100",
      "border-green-500",
      "text-green-700"
    );
    errorContainer.classList.add(
      "bg-red-100",
      "border-red-500",
      "text-red-700"
    );

    setTimeout(() => errorContainer.classList.add("hidden"), 5000);
  }
  function showConfirmation(message, onConfirm, anchorElement) {
    const box = document.getElementById("confirmBox");
    const msg = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    msg.textContent = message;

    // Position near clicked element
    const rect = anchorElement.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    box.style.position = "absolute";
    box.style.top = `${rect.top + scrollTop - 30}px`;
    box.style.left = `${rect.left + scrollLeft - 90}px`;
    box.style.borderRadius = "15px";
    box.classList.remove("hidden");

    // ❗ Close all imgNavMenus
    document
      .querySelectorAll(".imgNavMenu")
      .forEach((menu) => menu.classList.remove("show"));

    const cleanup = () => {
      box.classList.add("hidden");
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
      document.removeEventListener("click", outsideClickHandler);
    };

    const handleYes = () => {
      cleanup();
      onConfirm();
    };

    const handleNo = cleanup;

    const outsideClickHandler = (e) => {
      if (!box.contains(e.target) && e.target !== anchorElement) {
        cleanup();
      }
    };

    yesBtn.addEventListener("click", handleYes);
    noBtn.addEventListener("click", handleNo);
    setTimeout(() => {
      // Allow time to attach box to DOM before binding listener
      document.addEventListener("click", outsideClickHandler);
    }, 0);
  }

  function showSuccess(message) {
    if (!errorContainer || !errorMessage) return;
    errorMessage.textContent = message;

    errorContainer.classList.remove("hidden");
    errorContainer.classList.remove(
      "bg-red-100",
      "border-red-500",
      "text-red-700"
    );
    errorContainer.classList.add(
      "bg-green-100",
      "border-green-500",
      "text-green-700"
    );

    setTimeout(() => errorContainer.classList.add("hidden"), 5000);
  }

  async function fetchLandlordData() {
    try {
      const response = await fetch(`${BASE_URL}/api/landlords/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Unable to fetch landlord data");

      const data = await response.json();
      const landlord = data.landlord || {};
      const lodges = landlord.lodges || [];

      // Update personal details
      const profileImg = document.querySelector(".profile-image");
      if (profileImg) {
        profileImg.src =
          landlord.profile_picture || "../assets/images/avatar.png";
      }

      document
        .querySelectorAll(".personal-details .detail-item")
        .forEach((item) => {
          const label = item.querySelector(".label")?.textContent.trim();
          const valueElement = item.querySelector(".value");
          if (!label || !valueElement) return;

          switch (label) {
            case "Full Name:":
              valueElement.textContent = landlord.name || "N/A";
              break;
            case "Gender:":
              valueElement.textContent = landlord.gender || "N/A";
              break;
            case "Address:":
              valueElement.textContent = landlord.address || "N/A";
              break;
            case "Phone Number:":
              valueElement.textContent = landlord.phone_number || "N/A";
              break;
            case "E-mail:":
              valueElement.textContent = landlord.email || "N/A";
              break;
            case "Account Created:":
              valueElement.textContent = landlord.account_created
                ? new Date(landlord.account_created).toDateString()
                : "N/A";
              break;
            case "Verification Status:":
              valueElement.innerHTML = landlord.verification_status
                ? `<span class="verify">Verified</span>`
                : `<span class="not-verify">Not Verified</span>`;
              break;
            default:
              break;
          }
        });

      // Update top name and email
      const nameHeader = document.querySelector("h2.text-2xl");
      if (nameHeader) nameHeader.textContent = landlord.name || "Landlord";

      const emailText = document.querySelector(".tp-email");
      if (emailText) emailText.textContent = landlord.email || "";
      const lodgeDiv = document.getElementById("landlordLodges");
      if (lodgeDiv) {
        lodgeDiv.innerHTML = ""; // Clear existing content if any

        lodges.forEach((lodge, index) => {
          const lodgeHTML = `
            <div class="lodge-item">
              <div class="lodge-image-container relative">
                <div class="img-dots" onclick="toggleNav('imgNavMenu-${index}')">
                  <span class="i-dot"></span>
                  <span class="i-dot"></span>
                  <span class="i-dot"></span>
                </div>
      
                <img
                  src="${lodge.images?.[0] || "../assets/images/house1.jpg"}"
                  alt="Lodge Image"
                  class="lodge-image"
                />
                
                <div id="imgNavMenu-${index}" class="hidden imgNavMenu">
                  <ul>
                    <li class="py-1"><a href="#">Edit Lodge</a></li>
                    <li class="py-1"><a href="#" class="delete-lodge-btn" data-id="${
                      lodge.id
                    }">Delete Lodge</a></li>
                    <li class="py-1"><a href="#">Mark Lodge as Full</a></li>
                  </ul>
                </div>
              </div>
      
              <div class="lodge-details">
                <h4 class="l-name">${lodge.name}</h4>
                <p class="l-room">${lodge.available_rooms} Rooms Left</p>
              </div>
            </div>
          `;

          lodgeDiv.insertAdjacentHTML("beforeend", lodgeHTML);
        });
      }
    } catch (error) {
      console.error(error);
      showError(error.message || "An error occurred");
    }
    document.querySelectorAll(".delete-lodge-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        const lodgeId = btn.getAttribute("data-id");
        if (!lodgeId) return;

        showConfirmation(
          "Are you sure you want to delete this lodge?",
          async () => {
            const result = await deleteLodge(lodgeId, token);
            if (result) {
              showSuccess("Lodge deleted successfully");
              await fetchLandlordData(); // Refresh lodge list
            } else {
              showError("Failed to delete lodge");
            }
          },
          btn
        ); // Pass the clicked element here
      });
    });
  }

  await fetchLandlordData();
});
