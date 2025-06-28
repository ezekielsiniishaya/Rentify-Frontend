import { initFeedback } from "./feedback.js";
const dpModal = document.getElementById("dpModal");
const dpFileInput = document.getElementById("dpFileInput");
const dpPreview = document.getElementById("dpPreview");
const submitDpUpload = document.getElementById("submitDpUpload");
const cancelDpUpload = document.getElementById("cancelDpUpload");
const dpImage = document.getElementById("landlordDp");

// Show modal when "Change Picture" clicked
document.getElementById("changeDp").addEventListener("click", () => {
  dpFileInput.value = "";
  dpPreview.src = "";
  dpPreview.classList.add("hidden");
  dpModal.classList.remove("hidden");
});

// Preview when file is selected
dpFileInput.addEventListener("change", () => {
  const file = dpFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      dpPreview.src = e.target.result;
      dpPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    dpPreview.classList.add("hidden");
  }
});

// Upload when "Upload" button is clicked
submitDpUpload.addEventListener("click", async () => {
  const file = dpFileInput.files[0];
  if (!file) return showError("Please select a file");
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(
      "https://rentify-backend-production-f85a.up.railway.app/api/landlords/profile",
      {
        method: "PUT",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");

    dpImage.src = data.landlord.profile_picture;
    dpModal.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alert("Error uploading picture");
  }
});

// Cancel modal
cancelDpUpload.addEventListener("click", () => {
  dpModal.classList.add("hidden");
});
document.getElementById("removeDp").addEventListener("click", (e) => {
  const anchor = document.getElementById("removeDp");

  showConfirmation(
    "Remove your profile picture?",
    async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://rentify-backend-production-f85a.up.railway.app/api/landlords/profile-picture",
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to remove picture");

        showSuccess("Profile picture removed successfully");
        dpImage.src = "../assets/images/avatar.png"; // reset to default image
      } catch (err) {
        console.error(err);
        showError("Error removing picture");
      }
    },
    anchor
  );
});

function toggleNav(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isVisible = el.classList.contains("show");

  document
    .querySelectorAll(
      ".imgNavMenu, .nav-menu, #topNavMenu, #dp_menu, #lodgeMenu1, #lodgeMenu2"
    )
    .forEach((menu) => {
      menu.classList.remove("show");
      menu.classList.add("hidden");
    });

  if (!isVisible) {
    el.classList.add("show");
    el.classList.remove("hidden");
  }
}

// Global click handler to close all nav menus when clicking outside
document.addEventListener("click", (e) => {
  const clickedInsideMenu = e.target.closest(
    ".imgNavMenu, .nav-menu, #topNavMenu, #dp_menu"
  );
  const clickedToggleButton = e.target.closest("[data-menu-id]");

  if (!clickedInsideMenu && !clickedToggleButton) {
    document
      .querySelectorAll(".imgNavMenu, .nav-menu, #dp_menu, #topNavMenu")
      .forEach((menu) => {
        menu.classList.remove("show");
        menu.classList.add("hidden");
      });
  }
});

function attachImageNavListeners() {
  document.querySelectorAll("[data-menu-id^='imgNavMenu-']").forEach((el) => {
    const id = el.getAttribute("data-menu-id");
    if (!id) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleNav(id);
    });
  });
}
function attachTopNavListeners() {
  const topNavBtn = document.querySelector("[data-menu-id='topNavMenu']");
  if (!topNavBtn) return;

  topNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNav("topNavMenu");
  });
}
function attachProfilePictureNav() {
  const dpBtn = document.querySelector("[data-menu-id='dp_menu']");
  if (!dpBtn) return;

  dpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNav("dp_menu");
  });
}
function attachNavListeners() {
  attachImageNavListeners();
}

function showConfirmation(message, onConfirm, anchorElement) {
  const box = document.getElementById("confirmBox");
  const msg = document.getElementById("confirmMessage");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  msg.textContent = message;

  const rect = anchorElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  box.style.position = "absolute";
  //  Conditional position tweak if anchor is logoutBtn
  if (anchorElement.id === "logoutBtn") {
    box.style.top = `${
      rect.top + scrollTop + anchorElement.offsetHeight - 40
    }px`;
    box.style.left = `${rect.left + scrollLeft - 20}px`; // slightly left
  } else if (anchorElement.classList.contains("toggle-visibility-btn")) {
    box.style.top = `${
      rect.top + scrollTop + anchorElement.offsetHeight - 100
    }px`;
    box.style.left = `${rect.left + scrollLeft - 70}px`;
  } else if (anchorElement.id === "removeDp") {
    box.style.top = `${
      rect.top + scrollTop + anchorElement.offsetHeight - 90
    }px`;
    box.style.left = `${rect.left + scrollLeft - 37}px`; // slightly left
  } else {
    // Default positioning
    box.style.top = `${rect.top + scrollTop - 25}px`;
    box.style.left = `${rect.left + scrollLeft - 90}px`;
  }
  box.style.borderRadius = "15px";
  box.classList.remove("hidden");

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
  setTimeout(() => document.addEventListener("click", outsideClickHandler), 0);
}

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

    if (!response.ok) {
      showError(data.error || "Failed to delete lodge");
      console.error("Delete error:", data.error);
      return false;
    }

    showSuccess(data.message || "Lodge deleted successfully");
    return true;
  } catch (err) {
    console.error("Error deleting lodge:", err);
    showError("Server error while deleting lodge");
    return false;
  }
}

async function fetchLandlordData() {
  const BASE_URL = "https://rentify-backend-production-f85a.up.railway.app";
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/landlords/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Unable to fetch landlord data");

    const data = await response.json();
    const landlord = data.landlord || {};
    const lodges = landlord.lodges || [];

    document.querySelector(".profile-image").src =
      landlord.profile_picture || "../assets/images/avatar.png";
    document.querySelector("h2.text-2xl").textContent =
      landlord.name || "Landlord";
    document.querySelector(".tp-email").textContent = landlord.email || "";

    document
      .querySelectorAll(".personal-details .detail-item")
      .forEach((item) => {
        const label = item.querySelector(".label")?.textContent.trim();
        const valueElement = item.querySelector(".value");
        if (!label || !valueElement) return;

        switch (label) {
          case "Full Name:":
            valueElement.textContent = landlord.name || "Null";
            break;
          case "Gender:":
            valueElement.textContent = landlord.gender || "Null";
            break;
          case "Address:":
            valueElement.textContent = landlord.address || "Null";
            break;
          case "Phone Number:":
            valueElement.textContent = landlord.phone_number || "Null";
            break;
          case "Phone Number 2:":
            valueElement.textContent = landlord.phone_number_2 || "Null";
            break;
          case "E-mail:":
            valueElement.textContent = landlord.email || "Null";
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
          case "Language Preference:":
            valueElement.textContent = landlord.language_preference || "Null";
            break;
        }
      });

    const editProfileBtn = document.getElementById("editProfile");
    editProfileBtn.addEventListener("click", () => showEditForm(landlord));

    const lodgeDiv = document.getElementById("landlordLodges");
    lodgeDiv.innerHTML = "";

    lodges.forEach((lodge, index) => {
      const html = `
        <div class="lodge-item">
          <div class="lodge-image-container relative">
            <div class="img-dots" data-menu-id="imgNavMenu-${index}">
              <span class="i-dot"></span>
              <span class="i-dot"></span>
              <span class="i-dot"></span>
            </div>
            <img src="${
              lodge.images?.[0] || "../assets/images/house1.jpg"
            }" alt="Lodge Image" class="lodge-image" />
            <div id="imgNavMenu-${index}" class="hidden imgNavMenu">
 <ul>
  <li class="py-1">
    <a href="#" class="edit-lodge" data-id="${lodge.id}">Edit Lodge</a>
  </li>
  <li class="py-1">
    <a href="#" class="delete-lodge-btn" data-id="${lodge.id}">Delete Lodge</a>
  </li>
  <li class="py-1">
    <a href="#" class="toggle-visibility-btn" 
       data-lodge-id="${lodge.id}" 
       data-visible="${lodge.display_status}">
      ${lodge.display_status ? "Mark as Full" : "Mark as Available"}
    </a>
  </li>
</ul>

            </div>
          </div>
          <div class="lodge-details">
            <h4 class="l-name">${lodge.name}</h4>
            <p class="l-room">${lodge.available_rooms} Rooms Left</p>
          </div>
        </div>
      `;
      lodgeDiv.insertAdjacentHTML("beforeend", html);
    });

    attachNavListeners();

    // Delete lodge
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
              await fetchLandlordData();
            } else {
              showError("Failed to delete lodge");
            }
          },
          btn
        );
      });
    });
    document.querySelectorAll(".edit-lodge").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        const lodgeId = btn.dataset.id || btn.getAttribute("data-id");
        console.log(lodgeId);
        if (!lodgeId) {
          alert("Lodge ID missing");
          return;
        }
        localStorage.setItem("editingLodgeId", lodgeId);
        window.location.href = "upload_rentals.html";
      });
    });

    // Toggle visibility
    document.querySelectorAll(".toggle-visibility-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const lodgeId = button.dataset.lodgeId;
        const isVisible = button.dataset.visible === "true";
        const actionText = isVisible
          ? "Mark this lodge as Full?"
          : "Mark this lodge as Available?";
        showConfirmation(
          `${actionText}`,
          async () => {
            try {
              const response = await fetch(
                `${BASE_URL}/api/lodges/${lodgeId}/visibility`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ display_status: !isVisible }),
                }
              );

              const result = await response.json();

              if (response.ok) {
                showSuccess(result.message);
                await fetchLandlordData(); // Re-fetch data to reflect update
              } else {
                showError(result.error || "Visibility change failed");
              }
            } catch (err) {
              console.error(err);
              showError("Error updating visibility.");
            }
          },
          button // anchor for confirmation box
        );
      });
    });
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

function showMessage(message, isSuccess = false) {
  const errorContainer = document.getElementById("errorContainer");
  const errorMessage = document.getElementById("errorMessage");
  if (!errorContainer || !errorMessage) return;

  errorContainer.style.cssText = `
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: block;
  `;

  errorContainer.style.backgroundColor = isSuccess ? "#dcfce7" : "#fee2e2";
  errorContainer.style.border = isSuccess
    ? "1px solid #bbf7d0"
    : "1px solid #fecaca";
  errorContainer.style.color = isSuccess ? "#166534" : "#b91c1c";
  errorMessage.textContent = message;

  setTimeout(
    () => {
      errorContainer.style.display = "none";
    },
    isSuccess ? 3000 : 5000
  );
}

function showEditForm(landlord = {}) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px;
  `;

  const form = document.createElement("form");
  form.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  form.innerHTML = `
    <h2 style="text-align:center; margin-bottom:20px; color:#333;">Edit Profile</h2>
    <div id="errorContainer" style="display:none;">
      <p id="errorMessage"></p>
    </div>
    <div style="margin-bottom:16px;">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" placeholder="Enter your name"
    value="${landlord.name || ""}"
    style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
</div>

    <div style="margin-bottom:16px;">
      <label>Phone Number</label>
      <input type="tel" id="phone1" placeholder="08012345678" required
        value="${landlord.phone_number || ""}"
        style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
    </div>
    <div style="margin-bottom:16px;">
      <label>Phone Number 2</label>
      <input type="tel" id="phone2" placeholder="Optional"
        value="${landlord.phone_number_2 || ""}"
        style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
    </div>
    <div style="margin-bottom:16px;">
      <label>Address</label>
      <input type="text" id="address" placeholder="Enter your address"
        value="${landlord.address || ""}"
        style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
    </div>
   <div style="margin-bottom:16px;">
  <label for="gender">Gender</label>
  <select id="gender" name="gender"
    style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
    <option value="">Select your gender</option>
    <option value="male" ${
      landlord.gender === "male" ? "selected" : ""
    }>Male</option>
    <option value="female" ${
      landlord.gender === "female" ? "selected" : ""
    }>Female</option>
  </select>
</div>

    <div style="margin-bottom:16px;">
      <label>Language Preference</label>
      <input type="text" id="language" placeholder="e.g., English"
        value="${landlord.language_preference || ""}"
        style="width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:16px;">
    </div>
    <div style="display:flex; gap:12px; margin-top:20px;">
      <button type="submit" style="flex:1; padding:12px; background:#16a34a; color:white; border:none; border-radius:6px; font-weight:500; cursor:pointer;">Save</button>
      <button type="button" id="cancelEdit" style="flex:1; padding:12px; background:#e2e8f0; color:#4a5568; border:none; border-radius:6px; font-weight:500; cursor:pointer;">Cancel</button>
    </div>
  `;

  overlay.appendChild(form);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  const cancelBtn = form.querySelector("#cancelEdit");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "";
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = "";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const gender = document.getElementById("gender").value;
    const phone1 = document.getElementById("phone1").value.trim();
    const phone2 = document.getElementById("phone2").value.trim();
    const address = document.getElementById("address").value.trim();
    const language = document.getElementById("language").value.trim();
    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.textContent;

    if (phone1 && !/^(070|080|081|090|091)\d{8}$/.test(phone1)) {
      return showMessage("Please enter a valid phone number.");
    }

    if (phone2 && !/^(070|080|081|090|091)\d{8}$/.test(phone2)) {
      return showMessage("Please enter a valid second phone number.");
    }

    try {
      btn.disabled = true;
      btn.textContent = "Saving...";
      btn.style.opacity = "0.7";

      const data = {
        name,
        gender,
        phone_number: phone1,
        phone_number_2: phone2 || null,
        address,
        language_preference: language,
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://rentify-backend-production-f85a.up.railway.app/api/landlords/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Update failed.");

      showMessage("Profile updated successfully!", true);
      // Refresh profile after update
      await fetchLandlordData();
      attachNavListeners();
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = "";
      }, 1500);
    } catch (err) {
      showMessage(err.message || "Server error, try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.opacity = "1";
    }
  });
}

async function fetchLandlordViewOnly(landlordId) {
  // Hide profile picture and camera button (e.g., when not the owner)
  const profilePicture = document.getElementById("nav");
  const cameraButton = document.getElementById("cameraButton");

  if (profilePicture) profilePicture.classList.add("hidden");
  if (cameraButton) cameraButton.classList.add("hidden");

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `https://rentify-backend-production-f85a.up.railway.app/api/landlords/${landlordId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch landlord details.");

    const data = await res.json();
    const landlord = data.landlord;
    const lodges = landlord.lodges || [];

    // Populate UI with landlord info
    document.querySelector(".profile-image").src =
      landlord.profile_picture || "../assets/images/avatar.png";
    document.querySelector("h2.text-2xl").textContent =
      landlord.name || "Landlord";
    document.querySelector(".tp-email").textContent = landlord.email || "";

    document
      .querySelectorAll(".personal-details .detail-item")
      .forEach((item) => {
        const label = item.querySelector(".label")?.textContent.trim();
        const valueElement = item.querySelector(".value");
        if (!label || !valueElement) return;

        switch (label) {
          case "Full Name:":
            valueElement.textContent = landlord.name || "Null";
            break;
          case "Gender:":
            valueElement.textContent = landlord.gender || "Null";
            break;
          case "Address:":
            valueElement.textContent = landlord.address || "Null";
            break;
          case "Phone Number:":
            valueElement.textContent = landlord.phone_number || "Null";
            break;
          case "Phone Number 2:":
            valueElement.textContent = landlord.phone_number_2 || "Null";
            break;
          case "E-mail:":
            valueElement.textContent = landlord.email || "Null";
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
          case "Language Preference:":
            valueElement.textContent = landlord.language_preference || "Null";
            break;
        }
      });

    const lodgeDiv = document.getElementById("landlordLodges");
    lodgeDiv.innerHTML = "";

    lodges.forEach((lodge) => {
      const html = `
        <div class="lodge-item">
          <div class="lodge-image-container">
            <img src="${lodge.images?.[0] || "../assets/images/house1.jpg"}"
                 alt="Lodge Image" class="lodge-image" />
          </div>
          <div class="lodge-details">
            <h4 class="l-name">${lodge.name}</h4>
            <p class="l-room">${lodge.available_rooms} Rooms Left</p>
          </div>
        </div>
      `;
      lodgeDiv.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    console.error(err);
    showError("Could not load landlord profile.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const landlordId = localStorage.getItem("viewedLandlordId");

  if (landlordId) {
    // Read-only view for visitor
    await fetchLandlordViewOnly(landlordId);
  } else {
    // Authenticated landlord dashboard
    await fetchLandlordData();
    initFeedback();
    attachTopNavListeners();
    attachProfilePictureNav();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showConfirmation(
          "Are you sure you want to logout?",
          () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
            showSuccess("Logged out successfully");
            window.location.href = "../index.html";
          },
          logoutBtn
        );
      });
    }
  }
});
