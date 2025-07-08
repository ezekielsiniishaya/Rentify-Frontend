export function showError(message) {
  const container = document.getElementById("errorContainer");
  const text = document.getElementById("errorMessage");
  if (!container || !text) return;

  text.textContent = message;
  container.classList.remove("hidden");
  container.classList.add("block");
  container.style.display = "block";
  container.style.backgroundColor = "#fee2e2";
  container.style.borderLeft = "4px solid #ef4444";
  container.style.color = "#b91c1c";
  container.style.padding = "12px";
  container.style.marginBottom = "16px";
  container.style.borderRadius = "8px";
  container.style.fontWeight = "500";
  setTimeout(() => {
    container.classList.add("hidden");
    container.classList.remove("block");
  }, 5000);
}

export function showSuccess(message) {
  const container = document.getElementById("errorContainer");
  const text = document.getElementById("errorMessage");
  if (!container || !text) return;
  text.textContent = message;
  container.classList.remove("hidden");
  container.classList.add("block");
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

export function hideError() {
  const errorContainer = document.getElementById("errorContainer");
  if (errorContainer) errorContainer.style.display = "none";
}
