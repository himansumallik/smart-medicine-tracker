const BASE_URL = "http://43.205.130.165";

export const addMedicine = async (data) => {
  return await fetch(`${BASE_URL}/add-medicine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const getMedicines = async (userId) => {
  const res = await fetch(`${BASE_URL}/get-medicines/${userId}`);
  return res.json();
};