// main.js (utility functions)
export const API_BASE_URL = "http://localhost:5000/api";

export function postData(url = "", data = {}) {
  return fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
    