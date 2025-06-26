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
document.addEventListener("DOMContentLoaded", () => {
  const lodgeId = localStorage.getItem("editingLodgeId");
  console.log("Lodge ID:", lodgeId);

  const form = document.getElementById("uploadForm");
  const areaSelect = document.getElementById("areaSelect");
  const addImageBtn = document.getElementById("addImageBtn");
  const imageInput = document.getElementById("images");
  const imagePreview = document.getElementById("imagePreview");

  let selectedFiles = [];
  const MAX_IMAGES = 10;
  let isEdit = false;

  addImageBtn.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", () => {
    const newFiles = Array.from(imageInput.files);
    if (selectedFiles.length + newFiles.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    newFiles.forEach((file) => {
      if (!selectedFiles.some((f) => f.name === file.name)) {
        selectedFiles.push(file);
      }
    });

    updateImagePreview();
  });

  function updateImagePreview() {
    imagePreview.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wrapper = document.createElement("div");
        wrapper.className = "relative";

        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "w-24 h-24 object-cover rounded border border-gray-300";

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "×";
        removeBtn.className =
          "absolute top-[-8px] right-[-8px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
        removeBtn.addEventListener("click", () => {
          selectedFiles.splice(index, 1);
          updateImagePreview();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        imagePreview.appendChild(wrapper);
      };

      reader.readAsDataURL(file);
    });
  }

  async function fetchAreas() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://rentify-backend-production-f85a.up.railway.app/api/lodges/areas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      data.areas.forEach((area) => {
        const option = document.createElement("option");
        option.value = area.name;
        option.textContent = area.name;
        areaSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading areas:", err);
    }
  }

  async function loadLodgeForEdit(id) {
    document.getElementById("formTitle").textContent = "Edit Rental";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();
      const lodge = result.lodge;

      document.getElementById("lodgeName").value = lodge.name || "";
      document.getElementById("noRoom").value = lodge.available_rooms || "";
      document.getElementById("rentDuration").value = lodge.capacity || "";
      document.getElementById("price").value = lodge.price || "";
      document.getElementById("address").value = lodge.address || "";
      document.getElementById("description").value = lodge.description || "";

      areaSelect.value = lodge.area?.name || lodge.area_name || "";

      let imagesToDelete = [];

      lodge.images.forEach((imgUrl) => {
        const wrapper = document.createElement("div");
        wrapper.className = "relative";

        const image = document.createElement("img");
        image.src = imgUrl;
        image.className =
          "w-24 h-24 object-cover rounded border border-gray-300";

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "×";
        removeBtn.className =
          "absolute top-[-8px] right-[-8px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs";
        removeBtn.addEventListener("click", () => {
          imagesToDelete.push(imgUrl);
          wrapper.remove();
        });

        wrapper.appendChild(image);
        wrapper.appendChild(removeBtn);
        imagePreview.appendChild(wrapper);
      });

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.textContent = "Update Lodge";

      isEdit = true;
    } catch (err) {
      console.error("Could not load lodge for editing:", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("name", document.getElementById("lodgeName").value.trim());
    formData.append(
      "available_rooms",
      document.getElementById("noRoom").value.trim()
    );
    formData.append(
      "capacity",
      document.getElementById("rentDuration").value.trim()
    );
    formData.append("price", document.getElementById("price").value.trim());
    formData.append("address", document.getElementById("address").value.trim());
    formData.append("area", areaSelect.value);
    formData.append(
      "description",
      document.getElementById("description").value.trim()
    );

    selectedFiles.forEach((file) => formData.append("images", file));

    const endpoint = isEdit
      ? `https://rentify-backend-production-f85a.up.railway.app/api/lodges/${lodgeId}`
      : "https://rentify-backend-production-f85a.up.railway.app/api/lodges/add";

    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      const result = contentType.includes("application/json")
        ? await res.json()
        : { error: await res.text() };

      if (res.ok) {
        showSuccess(`Lodge ${isEdit ? "updated" : "created"} successfully!`);
        window.location.href = "landlord_profile.html";
      } else {
        showError(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Form submit error:", err);
    }
  });

  fetchAreas().then(async () => {
    if (lodgeId) {
      await loadLodgeForEdit(lodgeId);
    }
  });
});
