const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5170"
).replace(/\/$/, "");

const API_URL = `${API_BASE_URL}/api/categories`;

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const getCategories = () => request(API_URL);
export const getCategoryById = (id) => request(`${API_URL}/${id}`);

export const createCategory = (data) =>
  request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateCategory = (id, data) =>
  request(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteCategory = (id) =>
  request(`${API_URL}/${id}`, { method: "DELETE" });
